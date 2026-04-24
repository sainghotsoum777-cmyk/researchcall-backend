// ─────────────────────────────────────────────────────────
// backend/src/routes/auth.ts — Routes d'authentification
// ResearchCall MVP — Phase 1
// ─────────────────────────────────────────────────────────

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  JwtPayload,
} from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ─── Schémas de validation ───────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Min. 8 caractères'),
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  role: z.enum(['seeker', 'publisher', 'both']).default('both'),
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, 'Min. 8 caractères'),
});

// ═══════════════════════════════════════════════════════════
// POST /api/auth/register — Inscription
// ═══════════════════════════════════════════════════════════

router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({
        error: true,
        message: 'Un compte avec cet email existe déjà',
      });
      return;
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        institution: true,
        domains: true,
        interests: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Générer les tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Stocker le refresh token en BDD
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      },
    });

    res.status(201).json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/auth/login — Connexion
// ═══════════════════════════════════════════════════════════

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({
        error: true,
        message: 'Email ou mot de passe incorrect',
      });
      return;
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({
        error: true,
        message: 'Email ou mot de passe incorrect',
      });
      return;
    }

    // Générer les tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Stocker le refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Réponse sans passwordHash
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/auth/refresh — Rafraîchir le token
// ═══════════════════════════════════════════════════════════

router.post('/refresh', validate(refreshSchema), async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    // Vérifier le token
    let decoded: JwtPayload;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      res.status(401).json({ error: true, message: 'Refresh token invalide' });
      return;
    }

    // Vérifier en BDD
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      res.status(401).json({ error: true, message: 'Refresh token expiré' });
      return;
    }

    // Supprimer l'ancien refresh token (rotation)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Générer de nouveaux tokens
    const payload: JwtPayload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Stocker le nouveau refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: decoded.userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/auth/forgot-password — Mot de passe oublié
// ═══════════════════════════════════════════════════════════

router.post('/forgot-password', validate(forgotPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Toujours répondre 200 pour ne pas révéler l'existence d'un compte
    if (!user) {
      res.json({ message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' });
      return;
    }

    // TODO Phase 5 : Envoyer un email avec un lien de réinitialisation
    // Pour l'instant, on simule la réponse
    console.log(`[DEV] Password reset requested for: ${email}`);

    res.json({
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/auth/reset-password — Réinitialiser le mot de passe
// ═══════════════════════════════════════════════════════════

router.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    // TODO Phase 5 : Vérifier le token de réinitialisation et mettre à jour le mot de passe
    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

export default router;
