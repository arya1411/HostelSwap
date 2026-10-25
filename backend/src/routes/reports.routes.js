import { Router } from "express";
import { z } from "zod";
import { fail } from "../utils/http-error.js";
import { text } from "../validation/schemas.js";

export function reportsRoutes({ db, auth }) {
  const router = Router();
  router.post("/reports", auth, async (req, res) => {
    const d = z
      .object({
        listing_id: z.coerce.number().int().positive(),
        reason: text(10, 1000),
      })
      .parse(req.body);
    const { rows } = await db.query(
      "SELECT id FROM listings WHERE id=$1 AND status<>'hidden'",
      [d.listing_id],
    );
    if (!rows[0]) throw fail(404, "Listing not found.");
    const result = await db.query(
      "INSERT INTO reports(listing_id,reporter_id,reason) VALUES($1,$2,$3) RETURNING *",
      [d.listing_id, req.user.id, d.reason],
    );
    res.status(201).json(result.rows[0]);
  });
  return router;
}
