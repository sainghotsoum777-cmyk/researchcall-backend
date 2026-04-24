// ─────────────────────────────────────────────────────────
// backend/src/routes/calls.ts — Routes des appels (Phase 3)
// ResearchCall MVP — Full-text search + pagination avancée
// ─────────────────────────────────────────────────────────

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authenticate, requirePublisher, AuthRequest } from '../middleware/auth';
import {
  searchCalls,
  getPersonalizedFeed,
  getSearchSuggestions,
  SearchParams,
} from '../services/callService';
import { notifyNewCall } from '../services/notificationService';

const router = Router();
const prisma = new PrismaClient();

// ─── Schémas de validation ───────────────────────────────

const createCallSchema = z.object({
  title: z.string().min(10).max(200),
  type: z.enum(['communication', 'publication', 'colloque', 'projet', 'bourse', 'autre']),
  description: z.string().min(50),
  thematicAxes: z.array(z.string()).min(1),
  domains: z.array(z.string()).min(1),
  language: z.string().default('fr'),
  submissionDeadline: z.string().transform((s) => new Date(s)),
  notificationDate: z.string().transform((s) => new Date(s)).optional(),
  eventStartDate: z.string().transform((s) => new Date(s)).optional(),
  eventEndDate: z.string().transform((s) => new Date(s)).optional(),
  locationCity: z.string().optional(),
  locationCountry: z.string().optional(),
  locationModality: z.enum(['presentiel', 'en_ligne', 'hybride']).default('presentiel'),
  submissionConditions: z.string().optional(),
  contactEmail: z.string().email(),
  externalUrl: z.string().url().optional().or(z.literal('')),
});

const updateCallSchema = createCallSchema.partial();

const callSelect = {
  id: true, publisherId: true, title: true, type: true,
  description: true, status: true, thematicAxes: true, domains: true,
  language: true, submissionDeadline: true, notificationDate: true,
  eventStartDate: true, eventEndDate: true, locationCity: true,
  locationCountry: true, locationModality: true, submissionConditions: true,
  contactEmail: true, externalUrl: true, createdAt: true, updatedAt: true,
  publisher: { select: { id: true, firstName: true, lastName: true, institution: true } },
  attachments: { select: { id: true, fileName: true, fileUrl: true, fileSize: true, mimeType: true } },
  _count: { select: { favorites: true } },
};

// ═══════════════════════════════════════════════════════════
// GET /api/calls — Recherche avancée avec full-text search
// ═══════════════════════════════════════════════════════════

router.get('/', async (req: Request, res: Response) => {
  try {
    const params: SearchParams = {
      search: req.query.search as string,
      type: req.query.type as string,
      domain: req.query.domain as string,
      country: req.query.country as string,
      language: req.query.language as string,
      status: (req.query.status as string) || 'published',
      deadlineAfter: req.query.deadline_after as string,
      deadlineBefore: req.query.deadline_before as string,
      modality: req.query.modality as string,
      sort: (req.query.sort as string) || 'created_desc',
      page: Math.max(1, parseInt(req.query.page as string) || 1),
      limit: Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20)),
    };

    const result = await searchCalls(params);
    res.json(result);
  } catch (error) {
    console.error('Search calls error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /api/calls/feed — Feed personnalisé (paginé)
// ═══════════════════════════════════════════════════════════

router.get('/feed', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

    const result = await getPersonalizedFeed(req.user!.userId, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /api/calls/suggestions — Suggestions de recherche
// ═══════════════════════════════════════════════════════════

router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.length < 2) {
      res.json([]);
      return;
    }
    const suggestions = await getSearchSuggestions(query);
    res.json(suggestions);
  } catch (error) {
    console.error('Suggestions error:', error);
    res.json([]);
  }
});

// ═══════════════════════════════════════════════════════════
// GET /api/calls/stats — Statistiques globales
// ═══════════════════════════════════════════════════════════

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [total, byType, byCountry, upcoming] = await Promise.all([
      prisma.call.count({ where: { status: 'published' } }),
      prisma.call.groupBy({
        by: ['type'],
        where: { status: 'published' },
        _count: true,
      }),
      prisma.call.groupBy({
        by: ['locationCountry'],
        where: { status: 'published', locationCountry: { not: null } },
        _count: true,
        orderBy: { _count: { locationCountry: 'desc' } },
        take: 10,
      }),
      prisma.call.count({
        where: {
          status: 'published',
          submissionDeadline: { gte: new Date() },
        },
      }),
    ]);

    res.json({
      total,
      upcoming,
      byType: byType.map((t) => ({ type: t.type, count: t._count })),
      byCountry: byCountry.map((c) => ({ country: c.locationCountry, count: c._count })),
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /api/calls/:id — Détail d'un appel
// ═══════════════════════════════════════════════════════════

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const call = await prisma.call.findUnique({
      where: { id: req.params.id },
      select: callSelect,
    });
    if (!call) {
      res.status(404).json({ error: true, message: 'Appel introuvable' });
      return;
    }
    res.json(call);
  } catch (error) {
    console.error('Get call error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/calls — Publier un nouvel appel
// ═══════════════════════════════════════════════════════════

router.post('/', authenticate, requirePublisher, validate(createCallSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const call = await prisma.call.create({
        data: { ...req.body, publisherId: req.user!.userId, status: 'published', externalUrl: req.body.externalUrl || null },
        select: callSelect,
      });

      // Notifier les chercheurs dont les domaines correspondent (async, non-bloquant)
      notifyNewCall(call.id).catch((err) => console.error('Notify error:', err));

      res.status(201).json(call);
    } catch (error) {
      console.error('Create call error:', error);
      res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
  },
);

// ═══════════════════════════════════════════════════════════
// PUT /api/calls/:id — Modifier un appel
// ═══════════════════════════════════════════════════════════

router.put('/:id', authenticate, validate(updateCallSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.call.findUnique({ where: { id: req.params.id }, select: { publisherId: true } });
      if (!existing) { res.status(404).json({ error: true, message: 'Appel introuvable' }); return; }
      if (existing.publisherId !== req.user!.userId) { res.status(403).json({ error: true, message: 'Non autorisé' }); return; }
      const call = await prisma.call.update({ where: { id: req.params.id }, data: req.body, select: callSelect });
      res.json(call);
    } catch (error) {
      console.error('Update call error:', error);
      res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
  },
);

// ═══════════════════════════════════════════════════════════
// DELETE /api/calls/:id — Supprimer un appel
// ═══════════════════════════════════════════════════════════

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.call.findUnique({ where: { id: req.params.id }, select: { publisherId: true } });
    if (!existing) { res.status(404).json({ error: true, message: 'Appel introuvable' }); return; }
    if (existing.publisherId !== req.user!.userId) { res.status(403).json({ error: true, message: 'Non autorisé' }); return; }
    await prisma.call.delete({ where: { id: req.params.id } });
    res.json({ message: 'Appel supprimé avec succès' });
  } catch (error) {
    console.error('Delete call error:', error);
    res.status(500).json({ error: true, message: 'Erreur serveur' });
  }
});

export default router;
