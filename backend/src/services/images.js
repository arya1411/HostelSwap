import multer from "multer";
import sharp from "sharp";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fail } from "../utils/http-error.js";

export function createImageService(uploadDir) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 12, parts: 13 },
    fileFilter: (req, file, cb) =>
      cb(
        ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)
          ? null
          : fail(400, "Use a JPEG, PNG or WebP image."),
        true,
      ),
  }).single("image");
  const image = async (req) => {
    if (!req.file) return null;
    let data;
    try {
      const metadata = await sharp(req.file.buffer, {
        limitInputPixels: 25000000,
      }).metadata();
      if (!["jpeg", "png", "webp"].includes(metadata.format))
        throw new Error("Unsupported format");
      data = await sharp(req.file.buffer, { limitInputPixels: 25000000 })
        .rotate()
        .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      throw fail(400, "The uploaded file is not a valid supported image.");
    }
    await mkdir(uploadDir, { recursive: true });
    const name = `${randomUUID()}.webp`;
    await writeFile(path.join(uploadDir, name), data);
    return `/uploads/${name}`;
  };
  const clean = async (p) => {
    if (/^\/uploads\/[a-f0-9-]+\.webp$/.test(p || ""))
      await unlink(path.join(uploadDir, path.basename(p))).catch(() => {});
  };
  return { upload, image, clean };
}
