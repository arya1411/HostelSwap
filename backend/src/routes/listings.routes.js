import { Router } from "express";
import { z } from "zod";
import { fail } from "../utils/http-error.js";
import { text, listingSchema } from "../validation/schemas.js";
import { listingSelect } from "../db/queries.js";

export function listingsRoutes({ db, auth, upload, image, clean }) {
  const router = Router();
  const owned = async (req) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const { rows } = await db.query("SELECT * FROM listings WHERE id=$1", [id]);
    if (!rows[0]) throw fail(404, "Listing not found.");
    if (rows[0].seller_id !== req.user.id)
      throw fail(403, "You can only manage your own listings.");
    return rows[0];
  };
  router.get("/listings", async (req, res) => {
    const q = z
      .object({
        q: text(0, 120).optional(),
        category_id: z.coerce.number().int().positive().optional(),
        min: z.coerce.number().min(0).max(10000000).optional(),
        max: z.coerce.number().min(0).max(10000000).optional(),
        condition: z.enum(["Like New", "Good", "Fair"]).optional(),
        block: text(1, 50).optional(),
        sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
        page: z.coerce.number().int().min(1).max(10000).default(1),
        limit: z.coerce.number().int().min(1).max(48).default(12),
      })
      .parse(req.query);
    const params = [],
      where = ["l.status='available'"];
    const add = (sql, v) => {
      params.push(v);
      where.push(sql.replace("?", `$${params.length}`));
    };
    if (q.q) {
      params.push(`%${q.q}%`);
      where.push(
        `(l.title ILIKE $${params.length} OR l.description ILIKE $${params.length})`,
      );
    }
    for (const [key, col, op] of [
      ["category_id", "category_id", "="],
      ["min", "price", ">="],
      ["max", "price", "<="],
      ["condition", "condition", "="],
      ["block", "block", "="],
    ])
      if (q[key] !== undefined) add(`l.${col} ${op} ?`, q[key]);
    const count = await db.query(
      `SELECT count(*)::integer AS total FROM listings l WHERE ${where.join(" AND ")}`,
      params,
    );
    const sort = {
      newest: "l.created_at DESC,l.id DESC",
      price_asc: "l.price ASC,l.id DESC",
      price_desc: "l.price DESC,l.id DESC",
    }[q.sort];
    const { rows } = await db.query(
      `${listingSelect} WHERE ${where.join(" AND ")} ORDER BY ${sort} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, q.limit, (q.page - 1) * q.limit],
    );
    res.json({
      items: rows,
      total: count.rows[0].total,
      page: q.page,
      pages: Math.ceil(count.rows[0].total / q.limit),
    });
  });
  router.get("/listings/:id", async (req, res) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const { rows } = await db.query(
      `${listingSelect} WHERE l.id=$1 AND l.status<>'hidden'`,
      [id],
    );
    if (!rows[0]) throw fail(404, "Listing not found.");
    res.json(rows[0]);
  });
  router.get("/listings/:id/contact", auth, async (req, res) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const { rows } = await db.query(
      "SELECT u.name,u.email FROM listings l JOIN users u ON u.id=l.seller_id WHERE l.id=$1 AND l.status='available'",
      [id],
    );
    if (!rows[0]) throw fail(404, "This listing is unavailable.");
    res.json(rows[0]);
  });
  router.post("/listings", auth, upload, async (req, res) => {
    const d = listingSchema.parse(req.body);
    if (!req.file) throw fail(400, "Please add a product photo.");
    const p = await image(req);
    try {
      const { rows } = await db.query(
        `INSERT INTO listings(seller_id,category_id,title,description,price,original_price,condition,image_path,hostel_name,block) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [
          req.user.id,
          d.category_id,
          d.title,
          d.description,
          d.price,
          d.original_price,
          d.condition,
          p,
          d.hostel_name,
          d.block,
        ],
      );
      res.status(201).json(rows[0]);
    } catch (e) {
      await clean(p);
      throw e;
    }
  });
  router.put(
    "/listings/:id",
    auth,
    async (req, res, next) => {
      try {
        req.listing = await owned(req);
        next();
      } catch (e) {
        next(e);
      }
    },
    upload,
    async (req, res) => {
      const d = listingSchema.parse(req.body),
        old = req.listing,
        p = await image(req);
      try {
        const { rows } = await db.query(
          `UPDATE listings SET category_id=$1,title=$2,description=$3,price=$4,original_price=$5,condition=$6,image_path=$7,hostel_name=$8,block=$9 WHERE id=$10 RETURNING *`,
          [
            d.category_id,
            d.title,
            d.description,
            d.price,
            d.original_price,
            d.condition,
            p || old.image_path,
            d.hostel_name,
            d.block,
            old.id,
          ],
        );
        if (p) await clean(old.image_path);
        res.json(rows[0]);
      } catch (e) {
        await clean(p);
        throw e;
      }
    },
  );
  router.delete("/listings/:id", auth, async (req, res) => {
    const l = await owned(req);
    await db.query("DELETE FROM listings WHERE id=$1", [l.id]);
    await clean(l.image_path);
    res.status(204).end();
  });
  router.patch("/listings/:id/status", auth, async (req, res) => {
    const l = await owned(req);
    if (l.status === "hidden")
      throw fail(403, "This listing is hidden by a moderator.");
    const { status } = z
      .object({ status: z.enum(["available", "sold"]) })
      .parse(req.body);
    const { rows } = await db.query(
      "UPDATE listings SET status=$1 WHERE id=$2 AND status<>'hidden' RETURNING *",
      [status, l.id],
    );
    if (!rows[0])
      throw fail(409, "Listing status changed. Refresh and try again.");
    res.json(rows[0]);
  });
  return router;
}
