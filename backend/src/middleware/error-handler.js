import { z } from "zod";
import multer from "multer";

export function errorHandler(err, req, res, next) {
  if (err instanceof z.ZodError)
    return res
      .status(400)
      .json({
        error: err.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      });
  if (err instanceof multer.MulterError)
    return res
      .status(400)
      .json({
        error:
          err.code === "LIMIT_FILE_SIZE"
            ? "Photos must be smaller than 5 MB."
            : "Invalid upload. Send one image and the listing fields.",
      });
  if (err.code === "23505")
    return res
      .status(409)
      .json({
        error:
          req.path === "/api/reports"
            ? "You have already reported this listing."
            : "This email is already registered.",
      });
  if (err.code === "23503")
    return res
      .status(400)
      .json({ error: "The selected record no longer exists." });
  const status = err.status || 500;
  if (status >= 500) console.error("Request failed:", err.code || err.name);
  res
    .status(status)
    .json({
      error:
        status >= 500
          ? "Something went wrong. Please try again."
          : status === 400 && err.type === "entity.parse.failed"
            ? "Invalid JSON body."
            : err.message,
    });
}
