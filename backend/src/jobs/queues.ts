import { Queue } from "bullmq";
import { env } from "../common/config.js";

export const scanQueue = new Queue("scan-processing", {
  connection: { url: env.REDIS_URL }
});

export const notificationQueue = new Queue("expiry-notifications", {
  connection: { url: env.REDIS_URL }
});
