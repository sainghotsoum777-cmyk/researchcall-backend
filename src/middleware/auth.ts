// ─────────────────────────────────────────────────────────
// backend/src/middleware/auth.ts — Middleware d'authentification JWT
// ResearchCall MVP — Phase 1
// ─────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'researchcall-dev-secret-change-in-prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'researchcall-refresh-secret';
const JWT_EXPIRES_IN = '1h';
const JWT_REFRESH_EXPIRES_IN = '30d';

// ─── Types ───────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ─── Génération de tokens ────────────────────────────────

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}

// ─── Middleware : vérification du JWT ────────────────────

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
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
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
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

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
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

export function requirePublisher(req: AuthRequest, res: Response, next: NextFunction): void {
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
