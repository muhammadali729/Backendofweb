import dotenv from "dotenv";
import path from "path";
import fs from "fs";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
  console.log("📝 Loading .env file for development");
} else {
  console.log("🚀 Running in production mode");
}

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

import authRoutes from "./utils/routes/auth";
import contactRoutes from "./utils/routes/contact";
import chatbotRoutes from "./utils/routes/chatbot";
import portfolioRoutes from "./utils/routes/portfolio";
import testimonialRoutes from "./utils/routes/testimonials";
import serviceRoutes from "./utils/routes/service";
import userRoutes from "./utils/routes/user";
import adminRoutes from "./utils/routes/admin";

import { errorHandler } from "./middleware/errorhandler";
import { notFound } from "./middleware/notfound";
import { logger } from "./utils/logger";
import { connectDB } from "./database";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// ===================== Database =====================
connectDB().catch(err => {
  logger.error("❌ Database connection failed:", err.message);
  process.exit(1);
});

// ===================== Helmet (FIXED) =====================
app.use(
  helmet({
    crossOriginResourcePolicy: false, // 🔥 IMPORTANT FIX
    contentSecurityPolicy: false      // optional: avoid CSP blocking images
  })
);

// ===================== CORS =====================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://cloudrixsystems.com",
      "https://www.cloudrixsystems.com"
    ],
    credentials: true
  })
);

// ===================== 🔥 CORP FIX MIDDLEWARE =====================
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// ===================== Rate Limit =====================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 500 : 1000
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: process.env.NODE_ENV === "production" ? 30 : 50,
  delayMs: () => 500
});

app.use(limiter);
app.use(speedLimiter);

// ===================== Other Middleware =====================
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: msg => logger.info(msg.trim()) }
    })
  );
}

// ===================== Static Folders =====================
const imagesPath = path.join(process.cwd(), "public", "images");
const uploadsPath = path.join(process.cwd(), "uploads");

[imagesPath, uploadsPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use("/images", express.static(imagesPath));
app.use("/uploads", express.static(uploadsPath));

// ===================== Health =====================
app.get("/", (req, res) => {
  res.json({
    message: "Cloudrix API running 🚀",
    status: "healthy"
  });
});

app.get("/health", (_, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime()
  });
});

// ===================== Routes =====================
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// ===================== Errors =====================
app.use(notFound);
app.use(errorHandler);

// ===================== Start =====================
app.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

export default app;
