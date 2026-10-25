import { Router } from "express";
import { z } from "zod";
import { fail } from "../utils/http-error.js";

export function adminRoutes({ db, auth, admin }) {
  const router = Router();
  router.get("/admin/reports", auth, admin, async (req, res) =>
    res.json(
      (
        await db.query(
          `SELECT r.*,l.title,l.status AS listing_status,u.name AS reporter_name FROM reports r JOIN listings l ON l.id=r.listing_id JOIN users u ON u.id=r.reporter_id ORDER BY r.created_at DESC`,
        )
      ).rows,
    ),
  );
  router.patch(
    "/admin/listings/:id/moderation",
    auth,
    admin,
    async (req, res) => {
      const id = z.coerce.number().int().positive().parse(req.params.id);
      const { action } = z
        .object({ action: z.enum(["hide", "restore"]) })
        .parse(req.body);
      const { rows } = await db.query(
        action === "hide"
          ? `UPDATE listings SET pre_hidden_status=CASE WHEN status='hidden' THEN pre_hidden_status ELSE status END,status='hidden' WHERE id=$1 RETURNING *`
          : `UPDATE listings SET status=COALESCE(pre_hidden_status,'available'),pre_hidden_status=NULL WHERE id=$1 AND status='hidden' RETURNING *`,
        [id],
      );
      if (!rows[0]) throw fail(404, "Listing not found or already restored.");
      await db.query(
        "UPDATE reports SET status='reviewed' WHERE listing_id=$1",
        [id],
      );
      res.json(rows[0]);
    },
  );
  return router;
}
