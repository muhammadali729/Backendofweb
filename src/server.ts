import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import path from "path";
import fs from "fs";

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
const PORT = process.env.PORT || 5000;

connectDB();

// server.js ya app.js ke start mein
console.log('🔍 Checking environment variables:');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI length:', process.env.MONGODB_URI?.length);
console.log('MONGODB_URI starts with:', process.env.MONGODB_URI?.substring(0, 20));

// ===================== Helmet & Security =====================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "http:",
          "https:"
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"] // temporary inline allowed
      }
    }
  })
);

// ===================== CORS =====================
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true
  })
);

// ===================== Rate Limiting & Slow Down =====================
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 1000
  })
);

app.use(
  slowDown({
    windowMs: 15 * 60 * 1000, // 15 min
    delayAfter: 50,
    delayMs: () => 500
  })
);

// ===================== Other Middleware =====================
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  morgan("combined", {
    stream: {
      write: msg => logger.info(msg.trim())
    }
  })
);

// ===================== Static Folders =====================
const imagesPath = path.join(process.cwd(), "public", "images");
const uploadsPath = path.join(process.cwd(), "uploads");

// Debug logs
console.log("📁 Images Path:", imagesPath);
console.log("📂 Images Exists:", fs.existsSync(imagesPath));

app.use("/images", express.static(imagesPath));
app.use("/uploads", express.static(uploadsPath));

// ===================== Health Check =====================
app.get("/health", (_, res) => {
  res.json({ status: "OK" });
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

// ===================== Error Handling =====================
app.use(notFound);
app.use(errorHandler);

// ===================== Start Server =====================
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
