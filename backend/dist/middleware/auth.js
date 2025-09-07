"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const authenticateToken = async (req, res, next) => {
    const token = req.cookies.authToken || req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        let user;
        if (req.dbConnected && req.prisma) {
            user = await req.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, username: true, isAdmin: true, banned: true }
            });
        }
        else {
            // Fallback approach - import fallback users
            const { fallbackUsers } = require('../controllers/fallbackData');
            user = fallbackUsers.find((u) => u.id === decoded.userId);
            if (user) {
                user = {
                    id: user.id,
                    username: user.username,
                    isAdmin: user.isAdmin,
                    banned: user.banned
                };
            }
        }
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        if (user.banned) {
            return res.status(403).json({ error: 'Account is banned' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.js.map