import { Router, Request, Response } from "express";

const router = Router();

type Service = {
  id: string;
  slug: string;
  image: string;
  title: string;
  description: string;
  features: string[];
  order?: number;
  visible?: boolean;
  parentId?: string | null;
  color?: string;
  glowColor?: string;
};

const services: Service[] = [
  // Parents
  {
    id: "digital-marketing",
    slug: "digital-marketing",
    image: "digital-marketing.jpg",
    title: "Digital Marketing",
    description: "Data-driven marketing — social ads, content strategy and analytics that drive measurable growth.",
    features: [],
    order: 1,
    visible: true,
    parentId: null,
    color: "bg-gradient-to-br from-teal-500 to-cyan-400",
    glowColor: "shadow-teal-500/50"
  },
  {
    id: "creative-design",
    slug: "creative-design-services",
    image: "creative-design.jpg",
    title: "Creative Design Services",
    description: "Logos, UI/UX, marketing materials and full branding packages that tell your story visually.",
    features: [],
    order: 2,
    visible: true,
    parentId: null,
    color: "bg-gradient-to-br from-purple-500 to-pink-600",
    glowColor: "shadow-purple-500/50"
  },
  {
    id: "website-dev",
    slug: "custom-website-development",
    image: "website-dev.jpg",
    title: "Web & App Development",
    description: "Custom websites, mobile apps, and eCommerce platforms built to perform.",
    features: [],
    order: 3,
    visible: true,
    parentId: null,
    color: "bg-gradient-to-br from-blue-500 to-cyan-600",
    glowColor: "shadow-blue-500/50"
  },
  {
    id: "amazon-az",
    slug: "/management/amazon",
    image: "amazon-az.jpg",
    title: "Amazon A-Z Management",
    description: "Complete Amazon store management — product research, listing optimization, PPC campaigns and inventory control to boost sales.",
    features: [],
    order: 4,
    visible: true,
    parentId: null,
    color: "bg-gradient-to-br from-orange-500 to-red-600",
    glowColor: "shadow-orange-500/50"
  },
  {
    id: "ai-chatbot",
    slug: "ai-chatbot-development",
    image: "ai-chatbot.jpg",
    title: "AI Chatbot Development",
    description: "Conversational AI that automates support, qualifies leads and integrates with your CRM.",
    features: [],
    order: 5,
    visible: true,
    parentId: null,
    color: "bg-gradient-to-br from-red-500 to-pink-600",
    glowColor: "shadow-red-500/50"
  },

  // Children (Digital Marketing)
  {
    id: "social-media",
    slug: "social-media-marketing",
    image: "social-media.jpg",
    title: "Social Media Marketing",
    description: "Content creation, scheduling and ads to grow your social presence and engagement.",
    features: [],
    order: 1,
    visible: true,
    parentId: "digital-marketing",
    color: "bg-gradient-to-br from-blue-400 to-indigo-500",
    glowColor: "shadow-blue-400/50"
  },
  {
    id: "ads-management",
    slug: "/digital-marketing?section=advertising",
    image: "ads-management.jpg",
    title: "Advertising & Promotion",
    description: "Campaign creation and management across Google, Facebook and Amazon to drive targeted revenue.",
    features: [],
    order: 2,
    visible: true,
    parentId: "digital-marketing",
    color: "bg-gradient-to-br from-pink-500 to-rose-500",
    glowColor: "shadow-pink-500/50"
  },
  {
    id: "seo",
    slug: "seo-optimization",
    image: "seo.jpg",
    title: "SEO Optimization",
    description: "Technical and content SEO to increase organic visibility and improve rankings.",
    features: [],
    order: 3,
    visible: true,
    parentId: "digital-marketing",
    color: "bg-gradient-to-br from-green-500 to-emerald-600",
    glowColor: "shadow-green-500/50"
  },

  // Children (Creative Design)
  {
    id: "logo-design",
    slug: "logo-design",
    image: "logo-design.jpg",
    title: "Logo Design",
    description: "Memorable, versatile logos and complete brand kits for consistent recognition across all channels.",
    features: [],
    order: 1,
    visible: true,
    parentId: "creative-design",
    color: "bg-gradient-to-br from-rose-500 to-red-400",
    glowColor: "shadow-rose-500/50"
  },
  {
    id: "book-cover",
    slug: "/creative-design?section=book-cover",
    image: "book-cover.jpg",
    title: "Book Cover Design",
    description: "Attention-grabbing covers for eBook and print that fit your genre and marketing goals.",
    features: [],
    order: 2,
    visible: true,
    parentId: "creative-design",
    color: "bg-gradient-to-br from-emerald-500 to-green-400",
    glowColor: "shadow-emerald-500/50"
  },
  {
    id: "3d-models",
    slug: "/creative-design?section=three-d-model",
    image: "3d-models.jpg",
    title: "3D Model Design",
    description: "High-quality 3D models for products, characters and games — optimized for render and real-time engines.",
    features: [],
    order: 3,
    visible: true,
    parentId: "creative-design",
    color: "bg-gradient-to-br from-amber-500 to-yellow-600",
    glowColor: "shadow-amber-500/50"
  },
  {
    id: "comic-art",
    slug: "/creative-design?section=comic-art",
    image: "comic-art.jpg",
    title: "Comic Art Creation",
    description: "Comic-style illustrations, panel layouts and character art for stories, marketing and branding.",
    features: [],
    order: 4,
    visible: true,
    parentId: "creative-design",
    color: "bg-gradient-to-br from-fuchsia-500 to-pink-500",
    glowColor: "shadow-fuchsia-500/50"
  },
  {
    id: "character-design",
    slug: "character-design",
    image: "character-design.jpg",
    title: "Character Design",
    description: "Unique characters for games, animation and branding with turnarounds and expression sheets.",
    features: [],
    order: 5,
    visible: true,
    parentId: "creative-design",
    color: "bg-gradient-to-br from-indigo-400 to-blue-500",
    glowColor: "shadow-indigo-400/50"
  },
  {
    id: "anime-character",
    slug: "anime-character-design",
    image: "anime-character.jpg",
    title: "Anime Character Design",
    description: "Anime-style characters with strong silhouettes, dynamic poses and clean linework.",
    features: [],
    order: 6,
    visible: true,
    parentId: "creative-design",
    color: "bg-gradient-to-br from-pink-500 to-violet-500",
    glowColor: "shadow-pink-500/50"
  },
  {
    id: "reference-sheet",
    slug: "reference-sheet",
    image: "reference-sheet.jpg",
    title: "Reference Sheet Design",
    description: "Full reference sheets for characters including front/side/back views, palettes and expression breakdowns.",
    features: [],
    order: 7,
    visible: true,
    parentId: "creative-design",
    color: "bg-gradient-to-br from-yellow-400 to-orange-500",
    glowColor: "shadow-yellow-400/50"
  },

  // Children (Website Dev)
  {
    id: "website-dev-child",
    slug: "website-development",
    image: "website-dev.jpg",
    title: "Custom Website Development",
    description: "Stunning, responsive websites built for performance and conversions.",
    features: [],
    order: 1,
    visible: true,
    parentId: "website-dev",
    color: "bg-gradient-to-br from-blue-500 to-indigo-600",
    glowColor: "shadow-blue-500/50"
  },
  {
    id: "mobile-app",
    slug: "app-development",
    image: "mobile-app.jpg",
    title: "Mobile App Development",
    description: "Native and cross-platform mobile apps with polished UX.",
    features: [],
    order: 2,
    visible: true,
    parentId: "website-dev",
    color: "bg-gradient-to-br from-green-500 to-emerald-600",
    glowColor: "shadow-green-500/50"
  },
  {
    id: "ecommerce",
    slug: "ecommerce-solutions",
    image: "ecommerce.jpg",
    title: "E-commerce Solutions",
    description: "End-to-end eCommerce stores — product setup, checkout, payment integration.",
    features: [],
    order: 3,
    visible: true,
    parentId: "website-dev",
    color: "bg-gradient-to-br from-orange-500 to-yellow-600",
    glowColor: "shadow-orange-500/50"
  },
  {
    id: "website-management",
    slug: "website-management",
    image: "website-management.jpg",
    title: "Website Management",
    description: "Ongoing site maintenance, updates, backups and security monitoring.",
    features: [],
    order: 4,
    visible: true,
    parentId: "website-dev",
    color: "bg-gradient-to-br from-gray-500 to-gray-700",
    glowColor: "shadow-gray-500/50"
  },

  // Amazon Management Children
  {
    id: "amazon-product-research",
    slug: "/management/amazon",
    image: "amazon-product-research.jpg",
    title: "Amazon Product Research",
    description: "In-depth market analysis, competitor research, and profitable product identification for Amazon success.",
    features: [],
    order: 1,
    visible: true,
    parentId: "amazon-az",
    color: "bg-gradient-to-br from-emerald-500 to-teal-600",
    glowColor: "shadow-emerald-500/50"
  },
  {
    id: "amazon-listing-optimization",
    slug: "/management/amazon",
    image: "amazon-product-research.jpg",
    title: "Amazon Listing Optimization",
    description: "SEO-optimized titles, bullet points, descriptions and A+ content to maximize visibility and conversions.",
    features: [],
    order: 2,
    visible: true,
    parentId: "amazon-az",
    color: "bg-gradient-to-br from-violet-500 to-purple-600",
    glowColor: "shadow-violet-500/50"
  },
  {
    id: "amazon-ppc-campaigns",
    slug: "/management/amazon",
    image: "amazon-product-research.jpg",
    title: "Amazon PPC Campaigns",
    description: "Strategic sponsored ads management to increase sales while maintaining profitable ACOS and ROAS.",
    features: [],
    order: 3,
    visible: true,
    parentId: "amazon-az",
    color: "bg-gradient-to-br from-cyan-500 to-blue-600",
    glowColor: "shadow-cyan-500/50"
  },
  {
    id: "amazon-inventory-management",
    slug: "/management/amazon",
    image: "amazon-product-research.jpg",
    title: "Amazon Inventory Management",
    description: "Smart inventory planning, FBA shipment coordination, and stock level optimization to prevent stockouts.",
    features: [],
    order: 4,
    visible: true,
    parentId: "amazon-az",
    color: "bg-gradient-to-br from-amber-500 to-orange-600",
    glowColor: "shadow-amber-500/50"
  },

  // Shopify Management Children
  {
    id: "shopify-store-setup",
    slug: "/management/shopify",
    image: "shopify-store-setup.jpg",
    title: "Shopify Store Setup",
    description: "Complete store creation with custom themes, payment integration, and conversion-optimized design.",
    features: [],
    order: 1,
    visible: true,
    parentId: "website-dev",
    color: "bg-gradient-to-br from-green-500 to-emerald-600",
    glowColor: "shadow-green-500/50"
  },
  {
    id: "shopify-app-integration",
    slug: "/management/shopify",
    image: "mobile-app.jpg",
    title: "Shopify App Integration",
    description: "Essential app installation and configuration for marketing, analytics, and customer support automation.",
    features: [],
    order: 2,
    visible: true,
    parentId: "website-dev",
    color: "bg-gradient-to-br from-rose-500 to-pink-600",
    glowColor: "shadow-rose-500/50"
  },
  {
    id: "shopify-seo-optimization",
    slug: "seo-optimization",
    image: "seo.jpg",
    title: "Shopify SEO Optimization",
    description: "On-page SEO, meta tags, schema markup, and site speed optimization for better search rankings.",
    features: [],
    order: 3,
    visible: true,
    parentId: "website-dev",
    color: "bg-gradient-to-br from-indigo-500 to-blue-600",
    glowColor: "shadow-indigo-500/50"
  },

  // TikTok Management Children
  {
    id: "tiktok-content-strategy",
    slug: "/management/tiktok",
    image: "tiktok-management.jpg",
    title: "TikTok Management",
    description: "Viral content planning, trend analysis, and creative video concepts that engage your target audience.",
    features: [],
    order: 1,
    visible: true,
    parentId: "digital-marketing",
    color: "bg-gradient-to-br from-pink-500 to-rose-600",
    glowColor: "shadow-pink-500/50"
  },
  {
    id: "tiktok-video-production",
    slug: "/management/tiktok",
    image: "tiktok-management.jpg",
    title: "TikTok Video Production",
    description: "Professional video editing, effects, music sync, and storytelling for maximum engagement and shares.",
    features: [],
    order: 2,
    visible: true,
    parentId: "digital-marketing",
    color: "bg-gradient-to-br from-fuchsia-500 to-purple-600",
    glowColor: "shadow-fuchsia-500/50"
  },
  {
    id: "tiktok-ads-management",
    slug: "/management/tiktok",
    image: "tiktok-management.jpg",
    title: "TikTok Ads Management",
    description: "Targeted ad campaigns, audience optimization, and performance tracking to drive conversions and growth.",
    features: [],
    order: 3,
    visible: true,
    parentId: "digital-marketing",
    color: "bg-gradient-to-br from-violet-500 to-indigo-600",
    glowColor: "shadow-violet-500/50"
  },

  // Chatbot Children
  {
    id: "chatbot-overview",
    slug: "chatbot-service",
    image: "chatbot-faq.jpg",
    title: "Chatbot Overview",
    description: "Comprehensive AI chatbot capabilities, features, and benefits for automating customer interactions.",
    features: [],
    order: 1,
    visible: true,
    parentId: "ai-chatbot",
    color: "bg-gradient-to-br from-sky-500 to-cyan-600",
    glowColor: "shadow-sky-500/50"
  },
  {
    id: "chatbot-integration",
    slug: "chatbot-integration",
    image: "chatbot-integration.jpg",
    title: "Chatbot Integration",
    description: "Seamless integration with your website, CRM, social media, and existing business systems.",
    features: [],
    order: 2,
    visible: true,
    parentId: "ai-chatbot",
    color: "bg-gradient-to-br from-emerald-500 to-green-600",
    glowColor: "shadow-emerald-500/50"
  },
  {
    id: "chatbot-faq",
    slug: "chatbot-faq",
    image: "chatbot-faq.jpg",
    title: "Chatbot FAQ",
    description: "Common questions and answers about AI chatbot functionality, setup process, and ongoing support.",
    features: [],
    order: 3,
    visible: true,
    parentId: "ai-chatbot",
    color: "bg-gradient-to-br from-orange-500 to-red-600",
    glowColor: "shadow-orange-500/50"
  },
  {
    id: "chatbot-pricing",
    slug: "chatbot-pricing",
    image: "chatbot-pricing.png",
    title: "Chatbot Pricing",
    description: "Transparent pricing plans for AI chatbot development, customization, and monthly maintenance packages.",
    features: [],
    order: 4,
    visible: true,
    parentId: "ai-chatbot",
    color: "bg-gradient-to-br from-yellow-500 to-amber-600",
    glowColor: "shadow-yellow-500/50"
  }
];

// ==================== HELPER FUNCTIONS ====================

/**
 * 🔥 Get base URL based on environment
 * Production: Render URL ya custom domain
 * Development: localhost
 */
const getBaseUrl = (): string => {
  // Production (Render) URLs
  if (process.env.NODE_ENV === 'production') {
    // Render automatically provides this
    if (process.env.RENDER_EXTERNAL_URL) {
      return process.env.RENDER_EXTERNAL_URL;
    }
    // Custom domain agar ho to
    if (process.env.CUSTOM_DOMAIN) {
      return `https://${process.env.CUSTOM_DOMAIN}`;
    }
    // Default Render URL
    return 'https://cloudrix-api.onrender.com';
  }
  
  // Development
  return process.env.HOST || 'http://localhost:5000';
};

/**
 * 🔥 Get full image URL
 */
const getImageUrl = (imagePath: string): string => {
  const baseUrl = getBaseUrl();
  // Remove duplicate slashes
  return `${baseUrl}/images/${imagePath}`.replace(/([^:]\/)\/+/g, '$1');
};

// Helper: build nested structure
const buildTree = (flat: Service[]): any[] => {
  const map: Record<string, any> = {};
  const roots: any[] = [];

  flat.forEach((s) => {
    map[s.id] = { 
      ...s, 
      image: getImageUrl(s.image), // 🔥 Proper image URL
      children: [] 
    };
  });

  flat.forEach((s) => {
    if (s.parentId && map[s.parentId]) {
      map[s.parentId]?.children.push(map[s.id]);
    } else if (!s.parentId) {
      roots.push(map[s.id]);
    }
  });

  // sort children by order
  const sortRecursive = (nodes: any[]) => {
    nodes.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    nodes.forEach((n) => sortRecursive(n.children));
  };

  sortRecursive(roots);
  return roots;
};

// ==================== API ENDPOINTS ====================

/**
 * GET /api/services - Flat list of all services
 */
router.get("/", (req: Request, res: Response) => {
  try {
    console.log("📥 GET /api/services - Fetching flat services list");
    
    const { visible } = req.query;
    let list = [...services];
    
    // Filter by visibility if requested
    if (typeof visible === "string") {
      const v = visible.toLowerCase();
      if (v === "true" || v === "1") {
        list = list.filter((s) => s.visible !== false);
      }
    }

    // Add full image URLs
    const enrichedList = list.map(s => ({
      ...s,
      image: getImageUrl(s.image)
    }));

    console.log(`📤 Returning ${enrichedList.length} services (flat)`);
    res.json({
      success: true,
      count: enrichedList.length,
      data: enrichedList
    });
  } catch (error) {
    console.error("❌ Error in GET /api/services:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    });
  }
});

/**
 * GET /api/services/tree - Nested tree structure
 */
router.get("/tree", (req: Request, res: Response) => {
  try {
    console.log("📥 GET /api/services/tree - Fetching services tree");
    
    const { visible } = req.query;
    let list = [...services];
    
    // Filter by visibility if requested
    if (typeof visible === "string") {
      const v = visible.toLowerCase();
      if (v === "true" || v === "1") {
        list = list.filter((s) => s.visible !== false);
      }
    }

    const nested = buildTree(list);
    
    // Debug log
    console.log(`📤 Returning ${nested.length} parent services:`);
    nested.forEach((parent) => {
      console.log(`  └─ ${parent.title} (${parent.children?.length || 0} children)`);
    });
    
    res.json({
      success: true,
      count: nested.length,
      data: nested
    });
  } catch (error) {
    console.error("❌ Error in GET /api/services/tree:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    });
  }
});

/**
 * GET /api/services/:id - Get single service by ID
 */
router.get("/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`📥 GET /api/services/${id} - Fetching single service`);
    
    const service = services.find(s => s.id === id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: "Service not found"
      });
    }

    // Add full image URL
    const enrichedService = {
      ...service,
      image: getImageUrl(service.image)
    };

    res.json({
      success: true,
      data: enrichedService
    });
  } catch (error) {
    console.error(`❌ Error in GET /api/services/${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    });
  }
});

// ✅ IMPORTANT: Export router
export default router;
