import "dotenv/config";

import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

const isRunningInDocker = existsSync("/.dockerenv");

const getDatabaseUrl = () => {
  const databaseUrl = process.env["DATABASE_URL"];

  if (!databaseUrl) {
    return databaseUrl;
  }

  const parsedUrl = new URL(databaseUrl);

  if (parsedUrl.hostname === "postgres") {
    parsedUrl.port = isRunningInDocker ? "5432" : "5433";
    parsedUrl.hostname = isRunningInDocker ? "postgres" : "localhost";
  }

  return parsedUrl.toString();
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: getDatabaseUrl(),
  },
});
