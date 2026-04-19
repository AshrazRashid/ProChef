import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./common/config.js";
import { authRouter } from "./modules/auth/routes.js";
import { billingRouter } from "./modules/billing/routes.js";
import { notificationsRouter } from "./modules/notifications/routes.js";
import { pantryRouter } from "./modules/pantry/routes.js";
import { plannerRouter } from "./modules/planner/routes.js";
import { profileRouter } from "./modules/profile/routes.js";
import { recommendationsRouter } from "./modules/recommendations/routes.js";
import { scansRouter } from "./modules/scans/routes.js";
import { shoppingRouter } from "./modules/shopping/routes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "prochef-backend" });
});

app.use("/auth", authRouter);
app.use("/", profileRouter);
app.use("/pantry", pantryRouter);
app.use("/scans", scansRouter);
app.use("/recommendations", recommendationsRouter);
app.use("/meal-plans", plannerRouter);
app.use("/shopping-lists", shoppingRouter);
app.use("/billing", billingRouter);
app.use("/notifications", notificationsRouter);

app.listen(env.PORT, () => {
  console.log(`Backend listening on http://localhost:${env.PORT}`);
});
