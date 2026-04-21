import { Router } from "express";
import type Stripe from "stripe";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth } from "../../common/middleware.js";
import { env } from "../../common/config.js";

export const billingRouter = Router();
const stripe = env.STRIPE_SECRET_KEY ? new (await import("stripe")).default(env.STRIPE_SECRET_KEY) : null;

billingRouter.get("/plans", (_req, res) => {
  res.json({
    plans: [
      { code: "monthly_pro", amount: 999, currency: "usd", interval: "month" },
      { code: "yearly_pro", amount: 7999, currency: "usd", interval: "year" }
    ]
  });
});

billingRouter.post("/checkout-session", requireAuth, async (req: AuthedRequest, res) => {
  if (!stripe) {
    res.status(503).json({ message: "Stripe is not configured" });
    return;
  }

  const userId = req.user!.id;
  const userEmail = req.user!.email;
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId }
  });

  const customerId =
    existingSubscription?.stripeCustomerId ??
    (
      await stripe.customers.create({
        email: userEmail,
        metadata: { userId }
      })
    ).id;

  if (!existingSubscription) {
    await prisma.subscription.create({
      data: {
        userId,
        stripeCustomerId: customerId,
        planCode: "unassigned",
        status: "incomplete"
      }
    });
  }

  // Price IDs should be configured in Stripe dashboard and passed here by plan code mapping.
  // Placeholder checkout session keeps backend flow wired while prices are finalized.
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    success_url: "https://example.com/billing/success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "https://example.com/billing/cancel",
    line_items: [
      {
        price_data: {
          currency: "usd",
          recurring: { interval: "month" },
          product_data: { name: "ProChef Pro Monthly" },
          unit_amount: 999
        },
        quantity: 1
      }
    ],
    metadata: { userId }
  });

  res.json({
    checkoutUrl: session.url,
    userId
  });
});

billingRouter.get("/entitlements", requireAuth, async (req: AuthedRequest, res) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId: req.user!.id }
  });
  if (!subscription) {
    res.json({
      hasPro: false,
      planCode: null,
      status: "none",
      currentPeriodEnd: null
    });
    return;
  }

  const activeStatuses = new Set(["active", "trialing"]);
  const hasPro =
    activeStatuses.has(subscription.status) &&
    (!subscription.currentPeriodEnd || subscription.currentPeriodEnd.getTime() > Date.now());

  res.json({
    hasPro,
    planCode: subscription.planCode,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd
  });
});

function toIsoDate(value: number | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  return new Date(value * 1000);
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): number | null {
  const maybeLegacy = subscription as Stripe.Subscription & { current_period_end?: number };
  if (typeof maybeLegacy.current_period_end === "number") {
    return maybeLegacy.current_period_end;
  }
  const itemPeriodEnd = subscription.items.data[0]?.current_period_end;
  return typeof itemPeriodEnd === "number" ? itemPeriodEnd : null;
}

async function syncSubscriptionFromStripe(stripeSubscription: Stripe.Subscription) {
  const userId = stripeSubscription.metadata.userId;
  if (!userId) {
    return;
  }

  const customerId =
    typeof stripeSubscription.customer === "string" ? stripeSubscription.customer : stripeSubscription.customer.id;
  const lineItem = stripeSubscription.items.data[0];
  const planCode = lineItem?.price?.recurring?.interval === "year" ? "yearly_pro" : "monthly_pro";

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubscription.id,
      planCode,
      status: stripeSubscription.status,
      currentPeriodEnd: toIsoDate(getSubscriptionPeriodEnd(stripeSubscription))
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubscription.id,
      planCode,
      status: stripeSubscription.status,
      currentPeriodEnd: toIsoDate(getSubscriptionPeriodEnd(stripeSubscription))
    }
  });
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string | undefined) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return { status: 503, body: { message: "Stripe webhook is not configured" } };
  }
  if (!signature) {
    return { status: 400, body: { message: "Missing Stripe signature header" } };
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return { status: 400, body: { message: "Invalid Stripe signature" } };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

      if (userId && stripeCustomerId) {
        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId,
            stripeSubscriptionId:
              typeof session.subscription === "string" ? session.subscription : session.subscription?.id,
            planCode: "monthly_pro",
            status: "incomplete",
            currentPeriodEnd: null
          },
          update: {
            stripeCustomerId,
            stripeSubscriptionId:
              typeof session.subscription === "string" ? session.subscription : session.subscription?.id
          }
        });
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscriptionFromStripe(subscription);
      break;
    }
    default:
      break;
  }

  return { status: 200, body: { received: true } };
}
