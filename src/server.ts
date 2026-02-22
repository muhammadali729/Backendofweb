import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// 🔥 IMPORTANT: Pehle environment setup karo
if (process.env.NODE_ENV !== 'production') {
  // Development mein hi .env load karo
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  console.log('📝 Loading .env file for development');
} else {
  console.log('🚀 Running in production mode');
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

// 🔥 FIX: PORT ko number mein convert karo
const PORT = Number(process.env.PORT) || 5000;

// 🔥 Database connection with error handling
connectDB().catch(err => {
  logger.error('❌ Database connection failed:', err.message);
  process.exit(1);
});

// 🔥 Debug logging - Environment variables check
console.log('🔍 Environment Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT (raw):', process.env.PORT);
console.log('PORT (converted):', PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
if (process.env.MONGODB_URI) {
  console.log('MONGODB_URI starts with:', process.env.MONGODB_URI.substring(0, 25) + '...');
}

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
          "https:",
          `${process.env.RENDER_EXTERNAL_URL || ''}`
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"]
      }
    }
  })
);

// ===================== CORS =====================
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:3000",
      // 🔥 Render frontend URL add karo agar hai to
      process.env.FRONTEND_URL || "https://cloudrix-api.onrender.com"
    ].filter(Boolean),
    credentials: true
  })
);

// ===================== Rate Limiting & Slow Down =====================
// 🔥 Production mein rate limit thoda kam karo
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: process.env.NODE_ENV === 'production' ? 500 : 1000,
  message: 'Too many requests from this IP, please try again later.'
});

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: process.env.NODE_ENV === 'production' ? 30 : 50,
  delayMs: () => 500
});

app.use(limiter);
app.use(speedLimiter);

// ===================== Other Middleware =====================
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 🔥 Morgan logging with better production handling
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: msg => logger.info(msg.trim())
      }
    })
  );
}

// ===================== Static Folders =====================
const imagesPath = path.join(process.cwd(), "public", "images");
const uploadsPath = path.join(process.cwd(), "uploads");

// 🔥 Create directories if they don't exist
[imagesPath, uploadsPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

console.log("📁 Images Path:", imagesPath);
console.log("📂 Images Exists:", fs.existsSync(imagesPath));
console.log("📂 Uploads Exists:", fs.existsSync(uploadsPath));

app.use("/images", express.static(imagesPath));
app.use("/uploads", express.static(uploadsPath));

// ===================== Health Check =====================
app.get("/", (req, res) => {
  res.json({ 
    message: "Cloudrix API is running! 🚀",
    status: "healthy",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      contact: "/api/contact",
      chatbot: "/api/chatbot",
      portfolio: "/api/portfolio",
      testimonials: "/api/testimonials",
      services: "/api/services",
      users: "/api/users",
      admin: "/api/admin"
    }
  });
});

app.get("/health", (_, res) => {
  res.json({ 
    status: "OK",
    database: "connected",
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

// ===================== Error Handling =====================
app.use(notFound);
app.use(errorHandler);

// ===================== Start Server =====================
// 🔥 FIX: PORT number hai ab, error nahi aayega
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info(`📡 Listening on port ${PORT}`);
  logger.info(`📍 Health check: http://localhost:${PORT}/health`);
  logger.info(`📍 Public URL: https://cloudrix-api.onrender.com`);
});

// 🔥 Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

export default app;
