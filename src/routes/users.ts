// ─────────────────────────────────────────────────────────
// backend/src/routes/users.ts — Routes utilisateur
// ResearchCall MVP — Phase 1
// ─────────────────────────────────────────────────────────

import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ─── Schémas ─────────────────────────────────────────────

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  institution: z.string().min(1).optional(),
  laboratory: z.string().optional(),
  domains: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

const updateDomainsSchema = z.object({
  domains: z.array(z.string()).min(1, 'Au moins un domaine requis'),
  interests: z.array(z.string()).optional(),
});

// ═══════════════════════════════════════════════════════════
// GET /api/users/me — Profil de l'utilisateur connecté
// ═══════════════════════════════════════════════════════════

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
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
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// PUT /api/users/me — Modifier le profil
// ═══════════════════════════════════════════════════════════

router.put('/me', authenticate, validate(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
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
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// PUT /api/users/me/domains — Mettre à jour domaines & intérêts
// ═══════════════════════════════════════════════════════════

router.put('/me/domains', authenticate, validate(updateDomainsSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { domains, interests } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
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
  } catch (error) {
    console.error('Update domains error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/users/me/avatar — Upload photo de profil
// ═══════════════════════════════════════════════════════════

router.post('/me/avatar', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // TODO Phase 4 : Intégrer Multer + Supabase Storage / S3
    // Pour l'instant, on simule avec une URL placeholder
    const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${req.user!.userId}`;

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { avatarUrl },
    });

    res.json({ avatarUrl });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/users/me/push-token — Enregistrer le token push
// ═══════════════════════════════════════════════════════════

router.post('/me/push-token', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { pushToken } = req.body;

    if (!pushToken || typeof pushToken !== 'string') {
      res.status(400).json({ error: true, message: 'pushToken requis' });
      return;
    }

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { pushToken },
    });

    res.json({ message: 'Token push enregistré' });
  } catch (error) {
    console.error('Push token error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// DELETE /api/users/me — Supprimer le compte
// ═══════════════════════════════════════════════════════════

router.delete('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.delete({
      where: { id: req.user!.userId },
    });

    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

export default router;
