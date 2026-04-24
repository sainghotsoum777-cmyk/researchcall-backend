// ─────────────────────────────────────────────────────────
// backend/src/routes/notifications.ts — Routes notifications
// ResearchCall MVP — Phase 1
// ─────────────────────────────────────────────────────────

import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════
// GET /api/notifications — Mes notifications
// ═══════════════════════════════════════════════════════════

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// PUT /api/notifications/:id/read — Marquer comme lue
// ═══════════════════════════════════════════════════════════

router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
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
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// PUT /api/notifications/read-all — Tout marquer comme lu
// ═══════════════════════════════════════════════════════════

router.put('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

export default router;
