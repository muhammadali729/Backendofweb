"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
// routes
const auth_1 = __importDefault(require("./utils/routes/auth"));
const contact_1 = __importDefault(require("./utils/routes/contact"));
const chatbot_1 = __importDefault(require("./utils/routes/chatbot"));
const portfolio_1 = __importDefault(require("./utils/routes/portfolio"));
const testimonials_1 = __importDefault(require("./utils/routes/testimonials"));
const service_1 = __importDefault(require("./utils/routes/service"));
const user_1 = __importDefault(require("./utils/routes/user"));
const admin_1 = __importDefault(require("./utils/routes/admin"));
const errorhandler_1 = require("./middleware/errorhandler");
const notfound_1 = require("./middleware/notfound");
const logger_1 = require("./utils/logger");
const database_1 = require("./database");
// ===================== ENV =====================
if (process.env.NODE_ENV !== "production") {
    dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env") });
    console.log("📝 .env loaded (development)");
}
else {
    console.log("🚀 Production mode");
}
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
// ===================== DATABASE =====================
(0, database_1.connectDB)().catch((err) => {
    logger_1.logger.error("❌ DB connection failed:", err.message);
    process.exit(1);
});
// ===================== DEBUG =====================
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", PORT);
// ===================== SECURITY =====================
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:", "http:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
        },
    },
}));
// ===================== CORS (FIXED TS ERROR) =====================
const allowedOrigins = [
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
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
// ===================== RATE LIMIT =====================
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 500 : 1000,
}));
app.use((0, express_slow_down_1.default)({
    windowMs: 15 * 60 * 1000,
    delayAfter: process.env.NODE_ENV === "production" ? 30 : 50,
    delayMs: () => 500,
}));
// ===================== MIDDLEWARE =====================
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") {
    app.use((0, morgan_1.default)("dev"));
}
else {
    app.use((0, morgan_1.default)("combined", {
        stream: {
            write: (msg) => logger_1.logger.info(msg.trim()),
        },
    }));
}
// ===================== STATIC FILES (RENDER FIX) =====================
const BASE_DIR = process.cwd();
const imagesPath = path_1.default.join(BASE_DIR, "public", "images");
const uploadsPath = path_1.default.join(BASE_DIR, "uploads");
// ensure folders exist
[imagesPath, uploadsPath].forEach((dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
        console.log("📁 Created:", dir);
    }
});
console.log("📁 Images Path:", imagesPath);
console.log("📂 Images Exists:", fs_1.default.existsSync(imagesPath));
// serve static
app.use("/images", express_1.default.static(imagesPath));
app.use("/uploads", express_1.default.static(uploadsPath));
// ===================== ROOT =====================
app.get("/", (req, res) => {
    res.json({
        message: "Cloudrix API running 🚀",
        status: "OK",
        images: "/images/<filename>",
        health: "/health",
    });
});
// ===================== HEALTH =====================
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});
// ===================== DEBUG IMAGES =====================
app.get("/debug-images", (req, res) => {
    res.json({
        path: imagesPath,
        exists: fs_1.default.existsSync(imagesPath),
        files: fs_1.default.readdirSync(imagesPath),
    });
});
// ===================== ROUTES =====================
app.use("/api/auth", auth_1.default);
app.use("/api/contact", contact_1.default);
app.use("/api/chatbot", chatbot_1.default);
app.use("/api/portfolio", portfolio_1.default);
app.use("/api/testimonials", testimonials_1.default);
app.use("/api/services", service_1.default);
app.use("/api/users", user_1.default);
app.use("/api/admin", admin_1.default);
// ===================== ERROR HANDLING =====================
app.use(notfound_1.notFound);
app.use(errorhandler_1.errorHandler);
// ===================== START SERVER =====================
app.listen(PORT, "0.0.0.0", () => {
    logger_1.logger.info(`🚀 Server running in ${process.env.NODE_ENV || "development"}`);
    logger_1.logger.info(`📡 Port: ${PORT}`);
    logger_1.logger.info(`🌍 https://cloudrix-api.onrender.com`);
});
exports.default = app;
