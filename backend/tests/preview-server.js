// Ephemeral PostgreSQL-compatible fixture for browser tests. Never used by Docker or production.
import { PGlite } from "@electric-sql/pglite";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createApp } from "../src/app.js";
import { seed } from "../src/seed-data.js";
const db = new PGlite();
await db.exec(
  await readFile(new URL("../../database/init.sql", import.meta.url), "utf8"),
);
process.env.COLLEGE_EMAIL_DOMAINS = "college.edu";
process.env.DEMO_PASSWORD = "BrowserDemo123!";
await seed(db);
const uploadDir = await mkdtemp(path.join(tmpdir(), "hs-browser-"));
const server = createApp(db, {
  jwtSecret: "browser-test-only-secret-at-least-32-characters",
  uploadDir,
}).listen(3000, "127.0.0.1", () =>
  console.log("Ephemeral browser-test API on http://127.0.0.1:3000"),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(async () => {
      await db.close();
      await rm(uploadDir, { recursive: true, force: true });
      process.exit(0);
    }),
  );
