"use strict";
// ─────────────────────────────────────────────────────────
// backend/src/routes/notifications.ts — Routes notifications
// ResearchCall MVP — Phase 1
// ─────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// ═══════════════════════════════════════════════════════════
// GET /api/notifications — Mes notifications
// ═══════════════════════════════════════════════════════════
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.json(notifications);
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
// ═══════════════════════════════════════════════════════════
// PUT /api/notifications/:id/read — Marquer comme lue
// ═══════════════════════════════════════════════════════════
router.put('/:id/read', auth_1.authenticate, async (req, res) => {
    try {
        const notification = await prisma.notification.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.userId,
            },
        });
        if (!notification) {
            res.status(404).json({ error: true, message: 'Notification introuvable' });
            return;
        }
        const updated = await prisma.notification.update({
            where: { id: req.params.id },
            data: { isRead: true },
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
// ═══════════════════════════════════════════════════════════
// PUT /api/notifications/read-all — Tout marquer comme lu
// ═══════════════════════════════════════════════════════════
router.put('/read-all', auth_1.authenticate, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: {
                userId: req.user.userId,
                isRead: false,
            },
            data: { isRead: true },
        });
        res.json({ message: 'Toutes les notifications marquées comme lues' });
    }
    catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map