-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sex" TEXT;

-- AlterTable
ALTER TABLE "UserGoal" ADD COLUMN IF NOT EXISTS "targetWeeks" INTEGER;

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "caloriesPerServing" INTEGER;
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "proteinG" DOUBLE PRECISION;
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "carbsG" DOUBLE PRECISION;
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "fatG" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "MealLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loggedDate" DATE NOT NULL,
    "recipeId" TEXT,
    "label" TEXT,
    "calories" INTEGER NOT NULL,
    "proteinG" DOUBLE PRECISION NOT NULL,
    "carbG" DOUBLE PRECISION NOT NULL,
    "fatG" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeightLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressPhoto" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealLog_userId_loggedDate_idx" ON "MealLog"("userId", "loggedDate");

-- CreateIndex
CREATE INDEX "WeightLog_userId_loggedAt_idx" ON "WeightLog"("userId", "loggedAt");

-- CreateIndex
CREATE INDEX "ProgressPhoto_userId_monthKey_idx" ON "ProgressPhoto"("userId", "monthKey");

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightLog" ADD CONSTRAINT "WeightLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressPhoto" ADD CONSTRAINT "ProgressPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
