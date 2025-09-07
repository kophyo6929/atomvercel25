"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const fallbackData_1 = require("../controllers/fallbackData");
const router = express_1.default.Router();
// Get all products
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        let products;
        if (req.dbConnected && req.prisma) {
            products = await req.prisma.product.findMany({
                where: { available: true },
                orderBy: { operator: 'asc' }
            });
        }
        else {
            // Fallback approach
            products = fallbackData_1.fallbackProducts.filter((product) => product.available);
        }
        // Group products by operator and category
        const groupedProducts = products.reduce((acc, product) => {
            if (!acc[product.operator]) {
                acc[product.operator] = {};
            }
            if (!acc[product.operator][product.category]) {
                acc[product.operator][product.category] = [];
            }
            acc[product.operator][product.category].push(product);
            return acc;
        }, {});
        res.json({ products: groupedProducts });
    }
    catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
// Get product by ID
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        let product;
        if (req.dbConnected && req.prisma) {
            product = await req.prisma.product.findUnique({
                where: { id: req.params.id }
            });
        }
        else {
            // Fallback approach
            product = fallbackData_1.fallbackProducts.find((p) => p.id === req.params.id);
        }
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ product });
    }
    catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});
// Create product (admin only)
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id, operator, category, name, priceMMK, priceCr } = req.body;
        let product;
        if (req.dbConnected && req.prisma) {
            // Check if product ID already exists
            const existingProduct = await req.prisma.product.findUnique({
                where: { id }
            });
            if (existingProduct) {
                return res.status(400).json({ error: 'Product ID already exists' });
            }
            product = await req.prisma.product.create({
                data: {
                    id,
                    operator,
                    category,
                    name,
                    priceMMK: parseInt(priceMMK),
                    priceCr: parseInt(priceCr),
                    available: true
                }
            });
        }
        else {
            // Fallback approach - add to memory array
            const existingProduct = fallbackData_1.fallbackProducts.find((p) => p.id === id);
            if (existingProduct) {
                return res.status(400).json({ error: 'Product ID already exists' });
            }
            product = {
                id,
                operator,
                category,
                name,
                priceMMK: parseInt(priceMMK),
                priceCr: parseInt(priceCr),
                available: true
            };
            fallbackData_1.fallbackProducts.push(product);
        }
        res.status(201).json({ product });
    }
    catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});
// Update product (admin only)
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { operator, category, name, priceMMK, priceCr, available } = req.body;
        if (!req.prisma) {
            return res.status(500).json({ error: 'Database connection not available' });
        }
        const product = await req.prisma.product.update({
            where: { id: req.params.id },
            data: {
                operator,
                category,
                name,
                priceMMK: parseInt(priceMMK),
                priceCr: parseInt(priceCr),
                available
            }
        });
        res.json({ product });
    }
    catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});
// Delete product (admin only)
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        if (!req.prisma) {
            return res.status(500).json({ error: 'Database connection not available' });
        }
        await req.prisma.product.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map