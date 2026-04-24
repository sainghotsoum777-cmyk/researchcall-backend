"use strict";
// ─────────────────────────────────────────────────────────
// backend/src/routes/users.ts — Routes utilisateur
// ResearchCall MVP — Phase 1
// ─────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// ─── Schémas ─────────────────────────────────────────────
const updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).optional(),
    lastName: zod_1.z.string().min(2).optional(),
    institution: zod_1.z.string().min(1).optional(),
    laboratory: zod_1.z.string().optional(),
    domains: zod_1.z.array(zod_1.z.string()).optional(),
    interests: zod_1.z.array(zod_1.z.string()).optional(),
});
const updateDomainsSchema = zod_1.z.object({
    domains: zod_1.z.array(zod_1.z.string()).min(1, 'Au moins un domaine requis'),
    interests: zod_1.z.array(zod_1.z.string()).optional(),
});
// ═══════════════════════════════════════════════════════════
// GET /api/users/me — Profil de l'utilisateur connecté
// ═══════════════════════════════════════════════════════════
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                institution: true,
                laboratory: true,
                domains: true,
                interests: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            res.status(404).json({ error: true, message: 'Utilisateur introuvable' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
// ═══════════════════════════════════════════════════════════
// PUT /api/users/me — Modifier le profil
// ═══════════════════════════════════════════════════════════
router.put('/me', auth_1.authenticate, (0, validate_1.validate)(updateProfileSchema), async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: req.body,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                institution: true,
                laboratory: true,
                domains: true,
                interests: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.json(user);
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
// ═══════════════════════════════════════════════════════════
// PUT /api/users/me/domains — Mettre à jour domaines & intérêts
// ═══════════════════════════════════════════════════════════
router.put('/me/domains', auth_1.authenticate, (0, validate_1.validate)(updateDomainsSchema), async (req, res) => {
    try {
        const { domains, interests } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                domains,
                interests: interests || [],
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                institution: true,
                laboratory: true,
                domains: true,
                interests: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.json(user);
    }
    catch (error) {
        console.error('Update domains error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
// ═══════════════════════════════════════════════════════════
// POST /api/users/me/avatar — Upload photo de profil
// ═══════════════════════════════════════════════════════════
router.post('/me/avatar', auth_1.authenticate, async (req, res) => {
    try {
        // TODO Phase 4 : Intégrer Multer + Supabase Storage / S3
        // Pour l'instant, on simule avec une URL placeholder
        const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${req.user.userId}`;
        await prisma.user.update({
            where: { id: req.user.userId },
            data: { avatarUrl },
        });
        res.json({ avatarUrl });
    }
    catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
// ═══════════════════════════════════════════════════════════
// POST /api/users/me/push-token — Enregistrer le token push
// ═══════════════════════════════════════════════════════════
router.post('/me/push-token', auth_1.authenticate, async (req, res) => {
    try {
        const { pushToken } = req.body;
        if (!pushToken || typeof pushToken !== 'string') {
            res.status(400).json({ error: true, message: 'pushToken requis' });
            return;
        }
        await prisma.user.update({
            where: { id: req.user.userId },
            data: { pushToken },
        });
        res.json({ message: 'Token push enregistré' });
    }
    catch (error) {
        console.error('Push token error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
// ═══════════════════════════════════════════════════════════
// DELETE /api/users/me — Supprimer le compte
// ═══════════════════════════════════════════════════════════
router.delete('/me', auth_1.authenticate, async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.user.userId },
        });
        res.json({ message: 'Compte supprimé avec succès' });
    }
    catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map