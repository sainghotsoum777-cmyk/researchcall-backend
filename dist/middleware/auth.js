"use strict";
// ─────────────────────────────────────────────────────────
// backend/src/middleware/auth.ts — Middleware d'authentification JWT
// ResearchCall MVP — Phase 1
// ─────────────────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.authenticate = authenticate;
exports.requireRole = requireRole;
exports.requirePublisher = requirePublisher;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'researchcall-dev-secret-change-in-prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'researchcall-refresh-secret';
const JWT_EXPIRES_IN = '1h';
const JWT_REFRESH_EXPIRES_IN = '30d';
// ─── Génération de tokens ────────────────────────────────
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
}
// ─── Middleware : vérification du JWT ────────────────────
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            error: true,
            message: 'Token d\'accès requis',
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                error: true,
                message: 'Token expiré',
                code: 'TOKEN_EXPIRED',
            });
            return;
        }
        res.status(401).json({
            error: true,
            message: 'Token invalide',
        });
    }
}
// ─── Middleware : vérification du rôle ───────────────────
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                error: true,
                message: 'Authentification requise',
            });
            return;
        }
        if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
            res.status(403).json({
                error: true,
                message: 'Accès non autorisé pour ce rôle',
            });
            return;
        }
        next();
    };
}
// ─── Middleware : vérification publisher/both ────────────
function requirePublisher(req, res, next) {
    if (!req.user) {
        res.status(401).json({ error: true, message: 'Authentification requise' });
        return;
    }
    if (req.user.role !== 'publisher' && req.user.role !== 'both' && req.user.role !== 'admin') {
        res.status(403).json({
            error: true,
            message: 'Seuls les publicateurs peuvent effectuer cette action',
        });
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map