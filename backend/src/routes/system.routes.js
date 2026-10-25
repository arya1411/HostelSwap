import { Router } from "express";

export function systemRoutes({ db, domains }) {
  const router = Router();
  router.get("/health", async (req, res) => {
    await db.query("SELECT 1");
    res.json({ status: "ok" });
  });
  router.get("/config", (req, res) =>
    res.json({ collegeEmailDomains: domains }),
  );
  router.get("/categories", async (req, res) =>
    res.json((await db.query("SELECT * FROM categories ORDER BY id")).rows),
  );
  return router;
}
