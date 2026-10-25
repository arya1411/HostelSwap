import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { fail } from "../utils/http-error.js";
import { profile } from "../validation/schemas.js";
import { safeUser } from "../db/queries.js";

export function authRoutes({ db, domains, tokenFor, limiter }) {
  const router = Router();
  router.post("/auth/register", limiter, async (req, res) => {
    const data = profile
      .extend({
        email: z
          .email()
          .max(254)
          .transform((v) => v.toLowerCase()),
        password: z
          .string()
          .min(10)
          .max(72)
          .refine(
            (v) => Buffer.byteLength(v, "utf8") <= 72,
            "Password must be at most 72 UTF-8 bytes",
          ),
      })
      .parse(req.body);
    if (!domains.includes(data.email.split("@")[1]))
      throw fail(400, `Use a college email from: ${domains.join(", ")}`);
    const hash = await bcrypt.hash(data.password, 12);
    const { rows } = await db.query(
      `INSERT INTO users(name,email,password_hash,hostel_name,block) VALUES($1,$2,$3,$4,$5) RETURNING ${safeUser}`,
      [data.name, data.email, hash, data.hostel_name, data.block],
    );
    res.status(201).json({ user: rows[0], token: tokenFor(rows[0]) });
  });
  router.post("/auth/login", limiter, async (req, res) => {
    const data = z
      .object({
        email: z.email().max(254),
        password: z.string().min(1).max(72),
      })
      .parse(req.body);
    const { rows } = await db.query("SELECT * FROM users WHERE email=$1", [
      data.email.toLowerCase(),
    ]);
    const valid = await bcrypt.compare(
      data.password,
      rows[0]?.password_hash ||
        "$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW",
    );
    if (!rows[0] || !valid) throw fail(401, "Email or password is incorrect.");
    const { password_hash, ...user } = rows[0];
    res.json({ user, token: tokenFor(user) });
  });
  return router;
}
