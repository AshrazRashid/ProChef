import { Router } from "express";
import { z } from "zod";
import type Stripe from "stripe";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth } from "../../common/middleware.js";
import { env } from "../../common/config.js";

export const billingRouter = Router();
const stripe = env.STRIPE_SECRET_KEY ? new (await import("stripe")).default(env.STRIPE_SECRET_KEY) : null;

export async function readEntitlements(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  });
  if (!subscription) {
    return {
      hasPro: false,
      planCode: null as string | null,
      status: "none",
      currentPeriodEnd: null as Date | null
    };
  }

  /** Stripe statuses that should unlock premium app features */
  const entitledStatuses = new Set(["active", "trialing", "past_due"]);
  const hasPro =
    entitledStatuses.has(subscription.status) &&
    (!subscription.currentPeriodEnd || subscription.currentPeriodEnd.getTime() > Date.now());

  return {
    hasPro,
    planCode: subscription.planCode,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd
  };
}

billingRouter.get("/plans", (_req, res) => {
  res.json({
    plans: [
      { code: "monthly_pro", amountCents: 799, currency: "usd", interval: "month" },
      { code: "yearly_pro", amountCents: 5499, currency: "usd", interval: "year" }
    ]
  });
});

const checkoutBodySchema = z.object({
  plan: z.enum(["monthly", "yearly"])
});

billingRouter.post("/checkout-session", requireAuth, async (req: AuthedRequest, res) => {
  if (!stripe) {
    res.status(503).json({ message: "Stripe is not configured" });
    return;
  }

  const parsed = checkoutBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
    return;
  }

  const priceId =
    parsed.data.plan === "yearly" ? env.STRIPE_PRICE_ID_YEARLY : env.STRIPE_PRICE_ID_MONTHLY;
  if (!priceId) {
    res.status(503).json({
      message:
        "Stripe price IDs are not configured. Set STRIPE_PRICE_ID_MONTHLY and STRIPE_PRICE_ID_YEARLY in the environment."
    });
    return;
  }

  if (!env.CHECKOUT_SUCCESS_URL || !env.CHECKOUT_CANCEL_URL) {
    res.status(503).json({
      message:
        "Checkout return URLs are not configured. Set CHECKOUT_SUCCESS_URL and CHECKOUT_CANCEL_URL in backend/.env (use app deep links, e.g. prochef://billing/success?session_id={CHECKOUT_SESSION_ID})."
    });
    return;
  }

  const successUrl = env.CHECKOUT_SUCCESS_URL;
  const cancelUrl = env.CHECKOUT_CANCEL_URL;

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

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    metadata: { userId },
    subscription_data: {
      metadata: { userId }
    }
  });

  res.json({
    checkoutUrl: session.url,
    sessionId: session.id,
    userId
  });
});

billingRouter.get("/entitlements", requireAuth, async (req: AuthedRequest, res) => {
  res.json(await readEntitlements(req.user!.id));
});

/** Client calls this after redirect from Stripe with ?session_id= — syncs DB even if webhooks are delayed (local dev). */
billingRouter.post("/checkout-verify", requireAuth, async (req: AuthedRequest, res) => {
  if (!stripe) {
    res.status(503).json({ message: "Stripe is not configured" });
    return;
  }
  const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : "";
  if (!sessionId.startsWith("cs_")) {
    res.status(400).json({ message: "Missing or invalid sessionId" });
    return;
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"]
  });

  const sessionUserId = session.metadata?.userId ?? session.client_reference_id;
  if (!sessionUserId || sessionUserId !== req.user!.id) {
    res.status(403).json({ message: "Checkout session does not belong to this account" });
    return;
  }

  const subRef = session.subscription;
  const subId =
    typeof subRef === "string"
      ? subRef
      : subRef && typeof subRef === "object" && "id" in subRef
        ? (subRef as Stripe.Subscription).id
        : null;

  if (subId) {
    const stripeSub = await stripe.subscriptions.retrieve(subId);
    await syncSubscriptionFromStripe(stripeSub);
  }

  res.json(await readEntitlements(req.user!.id));
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
  const userId = stripeSubscription.metadata?.userId;
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
      const subRef = session.subscription;

      if (userId && stripeCustomerId) {
        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId,
            stripeSubscriptionId: typeof subRef === "string" ? subRef : subRef?.id ?? null,
            planCode: "unassigned",
            status: "incomplete",
            currentPeriodEnd: null
          },
          update: {
            stripeCustomerId,
            stripeSubscriptionId: typeof subRef === "string" ? subRef : subRef?.id ?? undefined
          }
        });
      }

      const subId = typeof subRef === "string" ? subRef : subRef?.id;
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        await syncSubscriptionFromStripe(sub);
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
