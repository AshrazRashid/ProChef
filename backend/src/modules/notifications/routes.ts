import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth } from "../../common/middleware.js";

const prefSchema = z.object({
  expiryPushEnabled: z.boolean(),
  mealPushEnabled: z.boolean()
});

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get("/preferences", async (req: AuthedRequest, res) => {
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: req.user!.id }
  });
  res.json(
    prefs ?? {
      expiryPushEnabled: true,
      mealPushEnabled: true
    }
  );
});

notificationsRouter.put("/preferences", async (req: AuthedRequest, res) => {
  const parse = prefSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const prefs = await prisma.notificationPreference.upsert({
    where: { userId: req.user!.id },
    create: { userId: req.user!.id, ...parse.data },
    update: parse.data
  });
  res.json(prefs);
});
