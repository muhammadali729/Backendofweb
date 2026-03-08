import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import sharp from "sharp"; // ⭐ Ab yeh error nahi aayega

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
  console.log("📝 Loading .env file for development");
} else {
  console.log("🚀 Running in production mode");
}

import express, { Request, Response, NextFunction } from "express"; // ⭐ Types import kiye
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
connectDB().catch((err: Error) => { // ⭐ Error type define kiya
  logger.error("❌ Database connection failed:", err.message);
  process.exit(1);
});

// ===================== Helmet =====================
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false
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

// ===================== CORP FIX MIDDLEWARE =====================
app.use((req: Request, res: Response, next: NextFunction) => {
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
      stream: { write: (msg: string) => logger.info(msg.trim()) } // ⭐ Type define kiya
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

// ===================== OPTIMIZED IMAGE MIDDLEWARE =====================
// ⭐ Fix: Type safety ke saath
app.use("/images/:filename", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filename = req.params.filename;
    if (!filename.match(/\.(jpg|jpeg|png)$/i)) {
      return next();
    }

    const baseName = path.basename(filename, path.extname(filename));
    const accept = req.headers.accept || "";
    
    // ⭐ Fix: Query parameter ko number mein convert kiya safely
    const sizeParam = req.query.size;
    let targetSize = 672;
    
    if (sizeParam && !Array.isArray(sizeParam)) {
      const parsedSize = parseInt(sizeParam as string, 10);
      const validSizes = [336, 672, 1008];
      if (validSizes.includes(parsedSize)) {
        targetSize = parsedSize;
      }
    }

    // AVIF format
    if (accept.includes("image/avif")) {
      const avifPath = path.join(imagesPath, `${baseName}-${targetSize}.avif`);
      if (fs.existsSync(avifPath)) {
        res.setHeader("Content-Type", "image/avif");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return res.sendFile(avifPath);
      }
    }
    
    // WebP format
    if (accept.includes("image/webp")) {
      const webpPath = path.join(imagesPath, `${baseName}-${targetSize}.webp`);
      if (fs.existsSync(webpPath)) {
        res.setHeader("Content-Type", "image/webp");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return res.sendFile(webpPath);
      }
    }
    
    // JPEG format
    const sizeJpegPath = path.join(imagesPath, `${baseName}-${targetSize}.jpg`);
    if (fs.existsSync(sizeJpegPath)) {
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.sendFile(sizeJpegPath);
    }
    
    next();
  } catch (error) {
    logger.error("Image optimization middleware error:", error instanceof Error ? error.message : String(error));
    next();
  }
});

// ===================== OPTIMIZED IMAGE GENERATION FUNCTION =====================
// ⭐ Fix: Parameters ka type define kiya
async function optimizeSingleImage(imagePath: string, baseName: string): Promise<string[]> {
  try {
    const sizes = [336, 672, 1008];
    const results: string[] = [];
    
    for (const size of sizes) {
      // WebP generate
      const webpPath = path.join(imagesPath, `${baseName}-${size}.webp`);
      if (!fs.existsSync(webpPath)) {
        await sharp(imagePath)
          .resize(size, size, { fit: 'cover', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(webpPath);
        results.push(`webp-${size}`);
      }
      
      // AVIF generate
      const avifPath = path.join(imagesPath, `${baseName}-${size}.avif`);
      if (!fs.existsSync(avifPath)) {
        await sharp(imagePath)
          .resize(size, size, { fit: 'cover', withoutEnlargement: true })
          .avif({ quality: 65 })
          .toFile(avifPath);
        results.push(`avif-${size}`);
      }
      
      // Compressed JPEG generate
      const jpegPath = path.join(imagesPath, `${baseName}-${size}.jpg`);
      if (!fs.existsSync(jpegPath)) {
        await sharp(imagePath)
          .resize(size, size, { fit: 'cover', withoutEnlargement: true })
          .jpeg({ quality: 70, progressive: true })
          .toFile(jpegPath);
        results.push(`jpeg-${size}`);
      }
    }
    
    return results;
  } catch (error) {
    logger.error(`Error optimizing ${baseName}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// ===================== BULK IMAGE OPTIMIZATION ENDPOINT =====================
app.post("/api/admin/optimize-all-images", async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (typeof apiKey !== 'string' || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: "Unauthorized - Invalid API Key" });
    }
    
    logger.info("🚀 Starting bulk image optimization...");
    
    const files = fs.readdirSync(imagesPath);
    const imageFiles = files.filter(f => 
      /\.(jpg|jpeg|png)$/i.test(f) && 
      !f.includes('-')
    );
    
    interface OptimizationResult {
      file: string;
      optimizedFormats: string[];
    }
    
    const results: OptimizationResult[] = [];
    
    for (const file of imageFiles) {
      const inputPath = path.join(imagesPath, file);
      const baseName = path.basename(file, path.extname(file));
      
      logger.info(`🖼️  Optimizing ${file}...`);
      
      const optimized = await optimizeSingleImage(inputPath, baseName);
      results.push({
        file,
        optimizedFormats: optimized
      });
    }
    
    logger.info("✅ Bulk image optimization complete!");
    
    res.json({
      message: "All images optimized successfully!",
      totalImages: imageFiles.length,
      results
    });
    
  } catch (error) {
    logger.error("Bulk optimization error:", error instanceof Error ? error.message : String(error));
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

// ===================== Health =====================
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Cloudrix API running 🚀",
    status: "healthy",
    imageOptimization: "enabled"
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    imagesOptimized: fs.existsSync(path.join(imagesPath, "amazon-az-672.webp"))
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
