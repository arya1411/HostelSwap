import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "node:path";
import { createAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error-handler.js";
import { createImageService } from "./services/images.js";
import { systemRoutes } from "./routes/system.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { usersRoutes } from "./routes/users.routes.js";
import { listingsRoutes } from "./routes/listings.routes.js";
import { reportsRoutes } from "./routes/reports.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";

export function createApp(db, config = {}) {
  const secret = config.jwtSecret || process.env.JWT_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("JWT_SECRET must contain at least 32 characters");
  const domains = (
    config.domains ||
    process.env.COLLEGE_EMAIL_DOMAINS ||
    "college.edu"
  )
    .split(",")
    .map((s) => s.trim().toLowerCase());
  const uploadDir =
    config.uploadDir || process.env.UPLOAD_DIR || path.resolve("uploads");
  const app = express();
  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-origin" } }));
  app.use(
    cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }),
  );
  app.use(express.json({ limit: "32kb" }));
  app.use(
    "/uploads",
    express.static(uploadDir, {
      dotfiles: "deny",
      index: false,
      immutable: true,
      maxAge: "1d",
      setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
    }),
  );
  const dependencies = {
    db,
    domains,
    ...createAuth(db, secret),
    ...createImageService(uploadDir),
  };
  app.use("/api", systemRoutes(dependencies));
  app.use("/api", authRoutes(dependencies));
  app.use("/api", usersRoutes(dependencies));
  app.use("/api", listingsRoutes(dependencies));
  app.use("/api", reportsRoutes(dependencies));
  app.use("/api", adminRoutes(dependencies));
  app.use((req, res) => res.status(404).json({ error: "Endpoint not found." }));
  app.use(errorHandler);
  return app;
}
