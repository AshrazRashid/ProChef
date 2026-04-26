import pino from "pino";
import { env } from "./config.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: "prochef-backend" },
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],
    remove: true
  }
});
