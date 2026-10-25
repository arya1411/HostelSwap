import { pool, waitForDatabase } from "./db.js";
import { seed } from "./seed-data.js";
try {
  await waitForDatabase();
  await seed(pool);
  console.log("Demo data ready. Existing accounts are preserved.");
} finally {
  await pool.end();
}
