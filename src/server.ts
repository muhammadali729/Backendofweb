import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import sharp from "sharp"; // ⭐ YEH IMPORT ADD KIYA (images optimize karne ke liye)

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

// ===================== ⭐ NEW: OPTIMIZED IMAGE MIDDLEWARE =====================
// Yeh middleware automatically WebP/AVIF serve karega agar browser support kare
app.use("/images/:filename", async (req, res, next) => {
  try {
    const filename = req.params.filename;
    // Sirf images ke liye kaam karo
    if (!filename.match(/\.(jpg|jpeg|png)$/i)) {
      return next();
    }

    const baseName = path.basename(filename, path.extname(filename));
    const accept = req.headers.accept || "";
    
    // Responsive size detect karo (agar query parameter ho)
    const size = req.query.size ? parseInt(req.query.size) : 672;
    const validSizes = [336, 672, 1008];
    const targetSize = validSizes.includes(size) ? size : 672;

    // ⭐ AVIF format (sabse chhota, newest format)
    if (accept.includes("image/avif")) {
      const avifPath = path.join(imagesPath, `${baseName}-${targetSize}.avif`);
      if (fs.existsSync(avifPath)) {
        res.setHeader("Content-Type", "image/avif");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return res.sendFile(avifPath);
      }
    }
    
    // ⭐ WebP format (middle ground)
    if (accept.includes("image/webp")) {
      const webpPath = path.join(imagesPath, `${baseName}-${targetSize}.webp`);
      if (fs.existsSync(webpPath)) {
        res.setHeader("Content-Type", "image/webp");
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return res.sendFile(webpPath);
      }
    }
    
    // Agar specific size ka JPEG ho toh
    const sizeJpegPath = path.join(imagesPath, `${baseName}-${targetSize}.jpg`);
    if (fs.existsSync(sizeJpegPath)) {
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.sendFile(sizeJpegPath);
    }
    
    // Warna original image serve karo
    next();
  } catch (error) {
    logger.error("Image optimization middleware error:", error);
    next();
  }
});

// ===================== ⭐ NEW: OPTIMIZED IMAGE GENERATION FUNCTION =====================
// Yeh function specific image ko optimize karta hai
async function optimizeSingleImage(imagePath, baseName) {
  try {
    const sizes = [336, 672, 1008];
    const results = [];
    
    for (const size of sizes) {
      // ⭐ WebP generate karo
      const webpPath = path.join(imagesPath, `${baseName}-${size}.webp`);
      if (!fs.existsSync(webpPath)) {
        await sharp(imagePath)
          .resize(size, size, { fit: 'cover', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(webpPath);
        results.push(`webp-${size}`);
      }
      
      // ⭐ AVIF generate karo (new format)
      const avifPath = path.join(imagesPath, `${baseName}-${size}.avif`);
      if (!fs.existsSync(avifPath)) {
        await sharp(imagePath)
          .resize(size, size, { fit: 'cover', withoutEnlargement: true })
          .avif({ quality: 65 })
          .toFile(avifPath);
        results.push(`avif-${size}`);
      }
      
      // ⭐ Compressed JPEG generate karo
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
    logger.error(`Error optimizing ${baseName}:`, error);
    throw error;
  }
}

// ===================== ⭐ NEW: BULK IMAGE OPTIMIZATION ENDPOINT =====================
// Sirf admin ke liye - saari images ek saath optimize karne ke liye
app.post("/api/admin/optimize-all-images", async (req, res) => {
  try {
    // Security check - simple API key se authenticate karo
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: "Unauthorized - Invalid API Key" });
    }
    
    logger.info("🚀 Starting bulk image optimization...");
    
    const files = fs.readdirSync(imagesPath);
    const imageFiles = files.filter(f => 
      /\.(jpg|jpeg|png)$/i.test(f) && 
      !f.includes('-') && // Already optimized images ko skip karo
      !f.includes('small')
    );
    
    const results = [];
    
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
    logger.error("Bulk optimization error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===================== ⭐ NEW: SINGLE IMAGE OPTIMIZATION ENDPOINT =====================
// Kisi ek image ko optimize karne ke liye (on-demand)
app.post("/api/admin/optimize-image/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const apiKey = req.headers['x-api-key'];
    
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const inputPath = path.join(imagesPath, filename);
    
    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: "Image not found" });
    }
    
    const baseName = path.basename(filename, path.extname(filename));
    const results = await optimizeSingleImage(inputPath, baseName);
    
    res.json({
      message: "Image optimized successfully!",
      filename,
      optimizedFormats: results
    });
    
  } catch (error) {
    logger.error("Single image optimization error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===================== ⭐ NEW: GET IMAGE INFO ENDPOINT =====================
// Kisi image ke baare mein information lene ke liye
app.get("/api/image-info/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const baseName = path.basename(filename, path.extname(filename));
    
    const sizes = [336, 672, 1008];
    const formats = ['jpg', 'webp', 'avif'];
    
    const availableVersions = [];
    
    for (const size of sizes) {
      for (const format of formats) {
        const filePath = path.join(imagesPath, `${baseName}-${size}.${format}`);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          availableVersions.push({
            size: `${size}x${size}`,
            format,
            fileSize: `${(stats.size / 1024).toFixed(2)} KiB`,
            url: `/images/${baseName}-${size}.${format}`
          });
        }
      }
    }
    
    res.json({
      filename,
      baseName,
      availableVersions
    });
    
  } catch (error) {
    logger.error("Image info error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===================== ⭐ NEW: SERVE RESPONSIVE IMAGES =====================
// Yeh route specific size ki image serve karega
app.get("/api/image/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const width = parseInt(req.query.w) || 672;
    const height = parseInt(req.query.h) || width;
    const format = req.query.f || 'auto';
    
    const inputPath = path.join(imagesPath, filename);
    
    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: "Image not found" });
    }
    
    const baseName = path.basename(filename, path.extname(filename));
    const ext = path.extname(filename);
    
    // Pehle check karo ke already optimized version exist karta hai ya nahi
    if (width === height && [336, 672, 1008].includes(width)) {
      if (format === 'webp' || format === 'auto') {
        const webpPath = path.join(imagesPath, `${baseName}-${width}.webp`);
        if (fs.existsSync(webpPath)) {
          return res.sendFile(webpPath);
        }
      }
      if (format === 'avif' || format === 'auto') {
        const avifPath = path.join(imagesPath, `${baseName}-${width}.avif`);
        if (fs.existsSync(avifPath)) {
          return res.sendFile(avifPath);
        }
      }
      const jpegPath = path.join(imagesPath, `${baseName}-${width}.jpg`);
      if (fs.existsSync(jpegPath)) {
        return res.sendFile(jpegPath);
      }
    }
    
    // Agar optimized version nahi mila toh on-the-fly generate karo
    let transformer = sharp(inputPath)
      .resize(width, height, { fit: 'cover', withoutEnlargement: true });
    
    if (format === 'webp') {
      res.setHeader("Content-Type", "image/webp");
      transformer = transformer.webp({ quality: 80 });
    } else if (format === 'avif') {
      res.setHeader("Content-Type", "image/avif");
      transformer = transformer.avif({ quality: 65 });
    } else {
      res.setHeader("Content-Type", `image/${ext.replace('.', '')}`);
      transformer = transformer.jpeg({ quality: 70, progressive: true });
    }
    
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    transformer.pipe(res);
    
  } catch (error) {
    logger.error("Responsive image error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===================== Health =====================
app.get("/", (req, res) => {
  res.json({
    message: "Cloudrix API running 🚀",
    status: "healthy",
    imageOptimization: "enabled" // ⭐ Added this
  });
});

app.get("/health", (_, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    imagesOptimized: fs.existsSync(path.join(imagesPath, "amazon-az-672.webp")) // ⭐ Check
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

// ===================== ⭐ STARTUP OPTIMIZATION =====================
// Jab server start ho, automatically images optimize ho jayein (optional)
async function optimizeImagesOnStartup() {
  try {
    logger.info("🔍 Checking for images that need optimization...");
    
    const files = fs.readdirSync(imagesPath);
    const imageFiles = files.filter(f => 
      /\.(jpg|jpeg|png)$/i.test(f) && 
      !f.includes('-') && 
      !f.includes('small')
    );
    
    for (const file of imageFiles) {
      const baseName = path.basename(file, path.extname(file));
      const webpExists = fs.existsSync(path.join(imagesPath, `${baseName}-672.webp`));
      
      if (!webpExists) {
        logger.info(`⚡ Optimizing ${file} on startup...`);
        const inputPath = path.join(imagesPath, file);
        await optimizeSingleImage(inputPath, baseName);
      }
    }
    
    logger.info("✅ Startup image check complete!");
  } catch (error) {
    logger.error("Startup optimization error:", error);
  }
}

// ===================== Start =====================
app.listen(PORT, "0.0.0.0", async () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  
  // ⭐ Optional: Startup pe images optimize karo (comment out kar sakte ho)
  // await optimizeImagesOnStartup();
});

export default app;
