import { pool, waitForDatabase } from "./db.js";
import { createApp } from "./app.js";
import { seed } from "./seed-data.js";
await waitForDatabase();
if (process.env.SEED_DEMO === "true") await seed(pool);
const server = createApp(pool).listen(process.env.PORT || 3000, () =>
  console.log("HostelSwap API listening"),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(async () => {
      await pool.end();
      process.exit(0);
    }),
  );
