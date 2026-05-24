"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("../logger");
const router = express_1.default.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = [
            {
                id: 'amazon',
                title: 'Amazon A-Z Management',
                description: 'Complete Amazon store management including product research, listing optimization, inventory management, and PPC advertising.',
                features: [
                    'Product Research & Sourcing',
                    'Listing Optimization',
                    'Inventory Management',
                    'PPC Advertising',
                    'Review Management',
                    'Competitor Analysis',
                    'Sales Analytics',
                    'Customer Support'
                ],
                icon: 'shopping-cart',
                color: 'blue',
                price: 'Starting at $299/month',
                duration: 'Ongoing',
                category: 'ecommerce'
            },
            {
                id: 'website',
                title: 'Website Development',
                description: 'Custom website development with responsive design, SEO optimization, and modern technologies.',
                features: [
                    'Responsive Design',
                    'SEO Optimization',
                    'CMS Integration',
                    'E-commerce Platforms',
                    'Performance Optimization',
                    'Security Implementation',
                    'Analytics Integration',
                    'Maintenance & Support'
                ],
                icon: 'globe',
                color: 'green',
                price: 'Starting at $2,500',
                duration: '2-6 weeks',
                category: 'development'
            },
            {
                id: 'mobile',
                title: 'Mobile App Development',
                description: 'Native and cross-platform mobile applications for iOS and Android platforms.',
                features: [
                    'Native iOS Development',
                    'Native Android Development',
                    'Cross-platform Solutions',
                    'UI/UX Design',
                    'App Store Optimization',
                    'Push Notifications',
                    'Offline Functionality',
                    'Performance Optimization'
                ],
                icon: 'smartphone',
                color: 'purple',
                price: 'Starting at $5,000',
                duration: '6-12 weeks',
                category: 'development'
            },
            {
                id: 'design',
                title: 'Graphic Design',
                description: 'Professional graphic design services including logos, brand identity, and marketing materials.',
                features: [
                    'Logo Design',
                    'Brand Identity',
                    'UI/UX Design',
                    'Marketing Materials',
                    'Social Media Graphics',
                    'Print Design',
                    'Illustration',
                    'Brand Guidelines'
                ],
                icon: 'palette',
                color: 'orange',
                price: 'Starting at $500',
                duration: '1-3 weeks',
                category: 'design'
            },
            {
                id: 'chatbot',
                title: 'AI Chatbot Development',
                description: 'Intelligent chatbots for customer support, lead generation, and process automation.',
                features: [
                    'Natural Language Processing',
                    '24/7 Customer Support',
                    'Lead Generation',
                    'Process Automation',
                    'Multi-platform Integration',
                    'Analytics Dashboard',
                    'Custom Training',
                    'API Integration'
                ],
                icon: 'bot',
                color: 'teal',
                price: 'Starting at $1,500',
                duration: '2-4 weeks',
                category: 'ai'
            },
            {
                id: 'crm',
                title: 'CRM Development',
                description: 'Custom CRM systems tailored to your business workflow and requirements.',
                features: [
                    'Contact Management',
                    'Sales Tracking',
                    'Pipeline Management',
                    'Analytics & Reporting',
                    'Team Collaboration',
                    'Email Integration',
                    'Custom Workflows',
                    'Mobile Access'
                ],
                icon: 'users',
                color: 'indigo',
                price: 'Starting at $3,000',
                duration: '4-8 weeks',
                category: 'business'
            },
            {
                id: 'saas',
                title: 'SaaS Development',
                description: 'Scalable software-as-a-service platforms with cloud architecture and subscription billing.',
                features: [
                    'Cloud Architecture',
                    'Multi-tenant Systems',
                    'Subscription Billing',
                    'Secure APIs',
                    'User Management',
                    'Analytics Dashboard',
                    'Scalable Infrastructure',
                    'DevOps Support'
                ],
                icon: 'cloud',
                color: 'cyan',
                price: 'Starting at $10,000',
                duration: '3-6 months',
                category: 'development'
            }
        ];
        res.json({
            success: true,
            data: services,
        });
    }
    catch (error) {
        logger_1.logger.error('Get services error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        // Your logic here
        res.status(200).json({ success: true, userId });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}));
try {
    const services = [
        {
            id: 'amazon',
            title: 'Amazon A-Z Management',
            description: 'Complete Amazon store management including product research, listing optimization, inventory management, and PPC advertising.',
            features: [
                'Product Research & Sourcing',
                'Listing Optimization',
                'Inventory Management',
                'PPC Advertising',
                'Review Management',
                'Competitor Analysis',
                'Sales Analytics',
                'Customer Support'
            ],
            icon: 'shopping-cart',
            color: 'blue',
            price: 'Starting at $299/month',
            duration: 'Ongoing',
            category: 'ecommerce'
        },
        {
            id: 'website',
            title: 'Website Development',
            description: 'Custom website development with responsive design, SEO optimization, and modern technologies.',
            features: [
                'Responsive Design',
                'SEO Optimization',
                'CMS Integration',
                'E-commerce Platforms',
                'Performance Optimization',
                'Security Implementation',
                'Analytics Integration',
                'Maintenance & Support'
            ],
            icon: 'globe',
            color: 'green',
            price: 'Starting at $2,500',
            duration: '2-6 weeks',
            category: 'development'
        },
        {
            id: 'mobile',
            title: 'Mobile App Development',
            description: 'Native and cross-platform mobile applications for iOS and Android platforms.',
            features: [
                'Native iOS Development',
                'Native Android Development',
                'Cross-platform Solutions',
                'UI/UX Design',
                'App Store Optimization',
                'Push Notifications',
                'Offline Functionality',
                'Performance Optimization'
            ],
            icon: 'smartphone',
            color: 'purple',
            price: 'Starting at $5,000',
            duration: '6-12 weeks',
            category: 'development'
        },
        {
            id: 'design',
            title: 'Graphic Design',
            description: 'Professional graphic design services including logos, brand identity, and marketing materials.',
            features: [
                'Logo Design',
                'Brand Identity',
                'UI/UX Design',
                'Marketing Materials',
                'Social Media Graphics',
                'Print Design',
                'Illustration',
                'Brand Guidelines'
            ],
            icon: 'palette',
            color: 'orange',
            price: 'Starting at $500',
            duration: '1-3 weeks',
            category: 'design'
        },
        {
            id: 'chatbot',
            title: 'AI Chatbot Development',
            description: 'Intelligent chatbots for customer support, lead generation, and process automation.',
            features: [
                'Natural Language Processing',
                '24/7 Customer Support',
                'Lead Generation',
                'Process Automation',
                'Multi-platform Integration',
                'Analytics Dashboard',
                'Custom Training',
                'API Integration'
            ],
            icon: 'bot',
            color: 'teal',
            price: 'Starting at $1,500',
            duration: '2-4 weeks',
            category: 'ai'
        },
        {
            id: 'crm',
            title: 'CRM Development',
            description: 'Custom CRM systems tailored to your business workflow and requirements.',
            features: [
                'Contact Management',
                'Sales Tracking',
                'Pipeline Management',
                'Analytics & Reporting',
                'Team Collaboration',
                'Email Integration',
                'Custom Workflows',
                'Mobile Access'
            ],
            icon: 'users',
            color: 'indigo',
            price: 'Starting at $3,000',
            duration: '4-8 weeks',
            category: 'business'
        },
        {
            id: 'saas',
            title: 'SaaS Development',
            description: 'Scalable software-as-a-service platforms with cloud architecture and subscription billing.',
            features: [
                'Cloud Architecture',
                'Multi-tenant Systems',
                'Subscription Billing',
                'Secure APIs',
                'User Management',
                'Analytics Dashboard',
                'Scalable Infrastructure',
                'DevOps Support'
            ],
            icon: 'cloud',
            color: 'cyan',
            price: 'Starting at $10,000',
            duration: '3-6 months',
            category: 'development'
        }
    ];
    const service = services.find(s => s.id === req.params.id);
    if (!service) {
        return res.status(404).json({
            success: false,
            error: 'Service not found',
        });
    }
    res.json({
        success: true,
        data: service,
    });
}
catch (error) {
    logger_1.logger.error('Get service error:', error);
    res.status(500).json({
        success: false,
        error: 'Server error',
    });
}
;
exports.default = router;
