import "dotenv/config";
import pg from "pg";
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});
pool.on("error", () =>
  console.error("Unexpected idle database connection error"),
);
export async function waitForDatabase() {
  for (let i = 0; i < 30; i++) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch {
      console.log(`Waiting for PostgreSQL (${i + 1}/30)`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("PostgreSQL did not become ready");
}
