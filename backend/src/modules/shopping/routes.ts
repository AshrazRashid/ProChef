import { Router } from "express";
import { prisma } from "../../common/db.js";
import { AuthedRequest, requireAuth } from "../../common/middleware.js";

export const shoppingRouter = Router();
shoppingRouter.use(requireAuth);

shoppingRouter.get("/current", async (req: AuthedRequest, res) => {
  const list = await prisma.shoppingList.findFirst({
    where: { userId: req.user!.id },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(list);
});
