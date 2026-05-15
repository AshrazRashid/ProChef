import { prisma } from "../../common/db.js";
import { assertScanObjectReadable } from "../../common/s3.js";

type DetectionSeed = {
  ingredientName: string;
  category: string;
  defaultUnit: string;
  confidence: number;
  rawLabel: string;
};

const seedDetections: DetectionSeed[] = [
  { ingredientName: "Tomato", category: "vegetable", defaultUnit: "unit", confidence: 0.91, rawLabel: "tomato" },
  { ingredientName: "Onion", category: "vegetable", defaultUnit: "unit", confidence: 0.86, rawLabel: "onion" },
  { ingredientName: "Egg", category: "protein", defaultUnit: "unit", confidence: 0.89, rawLabel: "egg" },
  {
    ingredientName: "Spinach",
    category: "vegetable",
    defaultUnit: "gram",
    confidence: 0.83,
    rawLabel: "spinach"
  },
  { ingredientName: "Salmon", category: "protein", defaultUnit: "gram", confidence: 0.81, rawLabel: "salmon" }
];

function pickDetections(scanSessionId: string) {
  const hash = Array.from(scanSessionId).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const first = hash % seedDetections.length;
  const second = (first + 2) % seedDetections.length;
  return [seedDetections[first], seedDetections[second]];
}

export async function processScanSession(scanSessionId: string) {
  await prisma.scanSession.update({
    where: { id: scanSessionId },
    data: { status: "processing" }
  });

  const scanSession = await prisma.scanSession.findUnique({ where: { id: scanSessionId } });
  if (!scanSession) {
    throw new Error(`Scan session ${scanSessionId} not found`);
  }

  await assertScanObjectReadable(scanSession.imageUrl);

  const pickedDetections = pickDetections(scanSessionId);

  await prisma.$transaction(async (tx) => {
    await tx.scanDetection.deleteMany({ where: { scanSessionId } });

    for (const detection of pickedDetections) {
      const ingredient = await tx.ingredient.upsert({
        where: { name: detection.ingredientName },
        update: {},
        create: {
          name: detection.ingredientName,
          category: detection.category,
          defaultUnit: detection.defaultUnit
        }
      });

      await tx.scanDetection.create({
        data: {
          scanSessionId,
          ingredientId: ingredient.id,
          confidence: detection.confidence,
          rawLabel: detection.rawLabel
        }
      });
    }
  });

  await prisma.scanSession.update({
    where: { id: scanSessionId },
    data: { status: "completed", completedAt: new Date() }
  });
}
