import { Router } from "express";
import { AuthedRequest, requireAuth } from "../../common/middleware.js";

export const billingRouter = Router();
billingRouter.use(requireAuth);

billingRouter.get("/plans", (_req, res) => {
  res.json({
    plans: [
      { code: "monthly_pro", amount: 999, currency: "usd", interval: "month" },
      { code: "yearly_pro", amount: 7999, currency: "usd", interval: "year" }
    ]
  });
});

billingRouter.post("/checkout-session", (req: AuthedRequest, res) => {
  res.json({
    checkoutUrl: "https://checkout.stripe.com/pay/cs_test_placeholder",
    userId: req.user!.id
  });
});
