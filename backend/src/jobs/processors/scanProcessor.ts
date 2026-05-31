import { prisma } from "../../common/db.js";
import { assertScanObjectReadable } from "../../common/s3.js";

/** Deterministic stub vision: pick 2–3 catalog ingredients per scan (replace with real model later). */
async function pickCatalogDetections(scanSessionId: string) {
  const catalog = await prisma.ingredient.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, category: true }
  });
  if (catalog.length === 0) {
    throw new Error("ingredient_catalog_empty_run_prisma_seed");
  }

  const hash = Array.from(scanSessionId).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const count = 2 + (hash % 2);
  const picked: typeof catalog = [];
  const seen = new Set<string>();

  for (let i = 0; i < catalog.length && picked.length < count; i++) {
    const row = catalog[(hash + i * 11) % catalog.length]!;
    if (seen.has(row.id)) {
      continue;
    }
    seen.add(row.id);
    picked.push(row);
  }

  return picked.map((row, i) => ({
    ingredientId: row.id,
    confidence: 0.72 + ((hash + i * 17) % 23) / 100,
    rawLabel: row.name.toLowerCase()
  }));
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

  const pickedDetections = await pickCatalogDetections(scanSessionId);

  await prisma.$transaction(async (tx) => {
    await tx.scanDetection.deleteMany({ where: { scanSessionId } });

    for (const detection of pickedDetections) {
      await tx.scanDetection.create({
        data: {
          scanSessionId,
          ingredientId: detection.ingredientId,
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
