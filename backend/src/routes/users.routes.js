import { Router } from "express";
import { profile } from "../validation/schemas.js";
import { safeUser, listingSelect } from "../db/queries.js";

export function usersRoutes({ db, auth }) {
  const router = Router();
  router.get(["/auth/me", "/users/me"], auth, (req, res) =>
    res.json(req.user),
  );
  router.patch("/users/me", auth, async (req, res) => {
    const d = profile.parse(req.body);
    const { rows } = await db.query(
      `UPDATE users SET name=$1,hostel_name=$2,block=$3 WHERE id=$4 RETURNING ${safeUser}`,
      [d.name, d.hostel_name, d.block, req.user.id],
    );
    res.json(rows[0]);
  });
  router.get("/users/me/listings", auth, async (req, res) =>
    res.json(
      (
        await db.query(
          `${listingSelect} WHERE seller_id=$1 ORDER BY l.created_at DESC`,
          [req.user.id],
        )
      ).rows,
    ),
  );
  return router;
}
