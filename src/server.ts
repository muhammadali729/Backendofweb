import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

// routes
import authRoutes from "./utils/routes/auth";
import contactRoutes from "./utils/routes/contact";
import chatbotRoutes from "./utils/routes/chatbot";
import portfolioRoutes from "./utils/routes/portfolio";
import testimonialsRoutes from "./utils/routes/testimonials";
import serviceRoutes from "./utils/routes/service";
import userRoutes from "./utils/routes/user";
import adminRoutes from "./utils/routes/admin";

import { errorHandler } from "./middleware/errorhandler";
import { notFound } from "./middleware/notfound";
import { logger } from "./utils/logger";
import { connectDB } from "./database";

// ===================== ENV =====================
if (process.env.NODE_ENV !== "production") {
    dotenv.config({ path: path.resolve(process.cwd(), ".env") });
    console.log("📝 .env loaded (development)");
} else {
    console.log("🚀 Production mode");
}

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 5000;

// ===================== DATABASE =====================
connectDB().catch((err: Error) => {
    logger.error("❌ DB connection failed:", err.message);
    process.exit(1);
});

// ===================== DEBUG =====================
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", PORT);

// ===================== SECURITY =====================
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "blob:", "http:", "https:"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
            },
        },
    })
);

// ===================== CORS (FIXED TS ERROR) =====================
const allowedOrigins: string[] = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://cloudrixsystems.com",
    "https://www.cloudrixsystems.com",
    "https://cloudrix-api.onrender.com",
];

// add env frontend safely
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

// ===================== RATE LIMIT =====================
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: process.env.NODE_ENV === "production" ? 500 : 1000,
    })
);

app.use(
    slowDown({
        windowMs: 15 * 60 * 1000,
        delayAfter: process.env.NODE_ENV === "production" ? 30 : 50,
        delayMs: () => 500,
    })
);

// ===================== MIDDLEWARE =====================
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
} else {
    app.use(
        morgan("combined", {
            stream: {
                write: (msg) => logger.info(msg.trim()),
            },
        })
    );
}

// ===================== STATIC FILES (RENDER FIX) =====================
const BASE_DIR = process.cwd();

const imagesPath = path.join(BASE_DIR, "public", "images");
const uploadsPath = path.join(BASE_DIR, "uploads");

// ensure folders exist
[imagesPath, uploadsPath].forEach((dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log("📁 Created:", dir);
    }
});

console.log("📁 Images Path:", imagesPath);
console.log("📂 Images Exists:", fs.existsSync(imagesPath));

// serve static
app.use("/images", express.static(imagesPath));
app.use("/uploads", express.static(uploadsPath));

// ===================== ROOT =====================
app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Cloudrix API running 🚀",
        status: "OK",
        images: "/images/<filename>",
        health: "/health",
    });
});

// ===================== HEALTH =====================
app.get("/health", (req: Request, res: Response) => {
    res.json({
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// ===================== DEBUG IMAGES =====================
app.get("/debug-images", (req: Request, res: Response) => {
    res.json({
        path: imagesPath,
        exists: fs.existsSync(imagesPath),
        files: fs.readdirSync(imagesPath),
    });
});

// ===================== ROUTES =====================
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// ===================== ERROR HANDLING =====================
app.use(notFound);
app.use(errorHandler);

// ===================== START SERVER =====================
app.listen(PORT, "0.0.0.0", () => {
    logger.info(`🚀 Server running in ${process.env.NODE_ENV || "development"}`);
    logger.info(`📡 Port: ${PORT}`);
    logger.info(`🌍 https://cloudrix-api.onrender.com`);
});

export default app;