import path from "path";
import fs from "fs";

// Load environment variables from .env file
try {
  const rootEnv = path.resolve(process.cwd(), ".env");
  const parentEnv = path.resolve(process.cwd(), "..", ".env");
  if (fs.existsSync(rootEnv)) {
    process.loadEnvFile(rootEnv);
  } else if (fs.existsSync(parentEnv)) {
    process.loadEnvFile(parentEnv);
  } else {
    process.loadEnvFile();
  }
} catch {
  // process.loadEnvFile throws if .env file does not exist, ignore
}

import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] || "5000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
