import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { fail } from "../utils/http-error.js";
import { safeUser } from "../db/queries.js";

export function createAuth(db, secret) {
  const auth = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
      if (!token) throw fail(401, "Please sign in to continue.");
      let decoded;
      try {
        decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
      } catch {
        throw fail(401, "Your session expired. Please sign in again.");
      }
      const { rows } = await db.query(
        `SELECT ${safeUser} FROM users WHERE id=$1`,
        [decoded.sub],
      );
      if (!rows[0]) throw fail(401, "Account not found.");
      req.user = rows[0];
      next();
    } catch (e) {
      next(e);
    }
  };
  const admin = (req, res, next) =>
    req.user.role === "admin"
      ? next()
      : next(fail(403, "Administrator access required."));
  const tokenFor = (u) =>
    jwt.sign({}, secret, {
      subject: String(u.id),
      expiresIn: "8h",
      algorithm: "HS256",
    });
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many attempts. Please try again in 15 minutes." },
  });
  return { auth, admin, tokenFor, limiter };
}
