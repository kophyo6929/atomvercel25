"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const fallbackData_1 = require("../controllers/fallbackData");
const router = express_1.default.Router();
// Get user profile
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        let user;
        if (req.dbConnected && req.prisma) {
            user = await req.prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    username: true,
                    isAdmin: true,
                    credits: true,
                    notifications: true,
                    createdAt: true,
                    _count: {
                        select: { orders: true }
                    }
                }
            });
        }
        else {
            // Fallback approach
            const fallbackUser = fallbackData_1.fallbackUsers.find(u => u.id === req.user.id);
            if (fallbackUser) {
                user = {
                    id: fallbackUser.id,
                    username: fallbackUser.username,
                    isAdmin: fallbackUser.isAdmin,
                    credits: fallbackUser.credits,
                    notifications: fallbackUser.notifications,
                    createdAt: fallbackUser.createdAt,
                    _count: { orders: 0 } // Simplified for fallback
                };
            }
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});
// Clear user notifications
router.post('/clear-notifications', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.dbConnected && req.prisma) {
            await req.prisma.user.update({
                where: { id: req.user.id },
                data: { notifications: [] }
            });
        }
        else {
            // Fallback approach
            const user = fallbackData_1.fallbackUsers.find((u) => u.id === req.user.id);
            if (user) {
                user.notifications = [];
            }
        }
        res.json({ message: 'Notifications cleared' });
    }
    catch (error) {
        console.error('Clear notifications error:', error);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});
// Get settings
router.get('/settings', async (req, res) => {
    try {
        let settingsMap = {};
        let paymentDetails = {};
        if (req.dbConnected && req.prisma) {
            const settings = await req.prisma.setting.findMany();
            const paymentAccounts = await req.prisma.paymentAccount.findMany({
                where: { active: true }
            });
            settingsMap = settings.reduce((acc, setting) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {});
            paymentDetails = paymentAccounts.reduce((acc, account) => {
                acc[account.provider] = {
                    name: account.name,
                    number: account.number
                };
                return acc;
            }, {});
        }
        else {
            // Fallback approach
            const { fallbackPaymentDetails, fallbackSettings } = require('../controllers/fallbackData');
            settingsMap = fallbackSettings;
            paymentDetails = fallbackPaymentDetails;
        }
        res.json({
            settings: settingsMap,
            paymentDetails,
            adminContact: settingsMap.adminContact || 'https://t.me/CEO_METAVERSE'
        });
    }
    catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map