import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth } from "../../common/middleware.js";

const createPlanSchema = z.object({
  weekStartDate: z.string().date()
});

export const plannerRouter = Router();
plannerRouter.use(requireAuth);

plannerRouter.post("/", async (req: AuthedRequest, res) => {
  const parse = createPlanSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const plan = await prisma.mealPlan.create({
    data: {
      userId: req.user!.id,
      weekStartDate: new Date(parse.data.weekStartDate),
      status: "draft"
    }
  });
  res.status(201).json(plan);
});

plannerRouter.get("/current", async (req: AuthedRequest, res) => {
  const plan = await prisma.mealPlan.findFirst({
    where: { userId: req.user!.id },
    include: { slots: true },
    orderBy: { weekStartDate: "desc" }
  });
  res.json(plan);
});
