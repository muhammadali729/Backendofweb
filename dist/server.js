"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
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
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
(0, database_1.connectDB)();
// ===================== Helmet & Security =====================
app.use((0, helmet_1.default)({
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
}));
// ===================== CORS =====================
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true
}));
// ===================== Rate Limiting & Slow Down =====================
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 1000
}));
app.use((0, express_slow_down_1.default)({
    windowMs: 15 * 60 * 1000, // 15 min
    delayAfter: 50,
    delayMs: () => 500
}));
// ===================== Other Middleware =====================
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("combined", {
    stream: {
        write: msg => logger_1.logger.info(msg.trim())
    }
}));
// ===================== Static Folders =====================
const imagesPath = path_1.default.join(process.cwd(), "public", "images");
const uploadsPath = path_1.default.join(process.cwd(), "uploads");
// Debug logs
console.log("📁 Images Path:", imagesPath);
console.log("📂 Images Exists:", fs_1.default.existsSync(imagesPath));
app.use("/images", express_1.default.static(imagesPath));
app.use("/uploads", express_1.default.static(uploadsPath));
// ===================== Health Check =====================
app.get("/health", (_, res) => {
    res.json({ status: "OK" });
});
// ===================== Routes =====================
app.use("/api/auth", auth_1.default);
app.use("/api/contact", contact_1.default);
app.use("/api/chatbot", chatbot_1.default);
app.use("/api/portfolio", portfolio_1.default);
app.use("/api/testimonials", testimonials_1.default);
app.use("/api/services", service_1.default);
app.use("/api/users", user_1.default);
app.use("/api/admin", admin_1.default);
// ===================== Error Handling =====================
app.use(notfound_1.notFound);
app.use(errorhandler_1.errorHandler);
// ===================== Start Server =====================
app.listen(PORT, () => {
    logger_1.logger.info(`🚀 Server running on http://localhost:${PORT}`);
});
exports.default = app;
