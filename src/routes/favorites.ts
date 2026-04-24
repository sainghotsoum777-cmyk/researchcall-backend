// ─────────────────────────────────────────────────────────
// backend/src/routes/favorites.ts — Routes des favoris
// ResearchCall MVP — Phase 1
// ─────────────────────────────────────────────────────────

import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════
// GET /api/favorites — Liste des appels sauvegardés
// ═══════════════════════════════════════════════════════════

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.userId },
      orderBy: { savedAt: 'desc' },
      include: {
        call: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            domains: true,
            submissionDeadline: true,
            locationCity: true,
            locationCountry: true,
            locationModality: true,
            createdAt: true,
            publisher: {
              select: {
                institution: true,
              },
            },
          },
        },
      },
    });

    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/favorites/:callId — Ajouter aux favoris
// ═══════════════════════════════════════════════════════════

router.post('/:callId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { callId } = req.params;

    // Vérifier que l'appel existe
    const call = await prisma.call.findUnique({ where: { id: callId } });
    if (!call) {
      res.status(404).json({ error: true, message: 'Appel introuvable' });
      return;
    }

    // Vérifier si déjà en favori
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_callId: {
          userId: req.user!.userId,
          callId,
        },
      },
    });

    if (existing) {
      res.status(409).json({ error: true, message: 'Déjà dans les favoris' });
      return;
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user!.userId,
        callId,
      },
    });

    res.status(201).json(favorite);
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// DELETE /api/favorites/:callId — Retirer des favoris
// ═══════════════════════════════════════════════════════════

router.delete('/:callId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { callId } = req.params;

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_callId: {
          userId: req.user!.userId,
          callId,
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: true, message: 'Favori introuvable' });
      return;
    }

    await prisma.favorite.delete({
      where: { id: existing.id },
    });

    res.json({ message: 'Retiré des favoris' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

export default router;
