"use strict";
// ─────────────────────────────────────────────────────────
// backend/src/routes/calls.ts — Routes des appels (Phase 3)
// ResearchCall MVP — Full-text search + pagination avancée
// ─────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const callService_1 = require("../services/callService");
const notificationService_1 = require("../services/notificationService");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// ─── Schémas de validation ───────────────────────────────
const createCallSchema = zod_1.z.object({
    title: zod_1.z.string().min(10).max(200),
    type: zod_1.z.enum(['communication', 'publication', 'colloque', 'projet', 'bourse', 'autre']),
    description: zod_1.z.string().min(50),
    thematicAxes: zod_1.z.array(zod_1.z.string()).min(1),
    domains: zod_1.z.array(zod_1.z.string()).min(1),
    language: zod_1.z.string().default('fr'),
    submissionDeadline: zod_1.z.string().transform((s) => new Date(s)),
    notificationDate: zod_1.z.string().transform((s) => new Date(s)).optional(),
    eventStartDate: zod_1.z.string().transform((s) => new Date(s)).optional(),
    eventEndDate: zod_1.z.string().transform((s) => new Date(s)).optional(),
    locationCity: zod_1.z.string().optional(),
    locationCountry: zod_1.z.string().optional(),
    locationModality: zod_1.z.enum(['presentiel', 'en_ligne', 'hybride']).default('presentiel'),
    submissionConditions: zod_1.z.string().optional(),
    contactEmail: zod_1.z.string().email(),
    externalUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
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
router.get('/', async (req, res) => {
    try {
        const params = {
            search: req.query.search,
            type: req.query.type,
            domain: req.query.domain,
            country: req.query.country,
            language: req.query.language,
            status: req.query.status || 'published',
            deadlineAfter: req.query.deadline_after,
            deadlineBefore: req.query.deadline_before,
            modality: req.query.modality,
            sort: req.query.sort || 'created_desc',
            page: Math.max(1, parseInt(req.query.page) || 1),
            limit: Math.min(50, Math.max(1, parseInt(req.query.limit) || 20)),
        };
        const result = await (0, callService_1.searchCalls)(params);
        res.json(result);
    }
    catch (error) {
        console.error('Search calls error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
// ═══════════════════════════════════════════════════════════
// GET /api/calls/feed — Feed personnalisé (paginé)
// ═══════════════════════════════════════════════════════════
router.get('/feed', auth_1.authenticate, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const result = await (0, callService_1.getPersonalizedFeed)(req.user.userId, page, limit);
        res.json(result);
    }
    catch (error) {
        console.error('Feed error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
// ═══════════════════════════════════════════════════════════
// GET /api/calls/suggestions — Suggestions de recherche
// ═══════════════════════════════════════════════════════════
router.get('/suggestions', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.length < 2) {
            res.json([]);
            return;
        }
        const suggestions = await (0, callService_1.getSearchSuggestions)(query);
        res.json(suggestions);
    }
    catch (error) {
        console.error('Suggestions error:', error);
        res.json([]);
    }
});
// ═══════════════════════════════════════════════════════════
// GET /api/calls/stats — Statistiques globales
// ═══════════════════════════════════════════════════════════
router.get('/stats', async (_req, res) => {
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
    }
    catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
// ═══════════════════════════════════════════════════════════
// GET /api/calls/:id — Détail d'un appel
// ═══════════════════════════════════════════════════════════
router.get('/:id', async (req, res) => {
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
    }
    catch (error) {
        console.error('Get call error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
// ═══════════════════════════════════════════════════════════
// POST /api/calls — Publier un nouvel appel
// ═══════════════════════════════════════════════════════════
router.post('/', auth_1.authenticate, auth_1.requirePublisher, (0, validate_1.validate)(createCallSchema), async (req, res) => {
    try {
        const call = await prisma.call.create({
            data: { ...req.body, publisherId: req.user.userId, status: 'published', externalUrl: req.body.externalUrl || null },
            select: callSelect,
        });
        // Notifier les chercheurs dont les domaines correspondent (async, non-bloquant)
        (0, notificationService_1.notifyNewCall)(call.id).catch((err) => console.error('Notify error:', err));
        res.status(201).json(call);
    }
    catch (error) {
        console.error('Create call error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
// ═══════════════════════════════════════════════════════════
// PUT /api/calls/:id — Modifier un appel
// ═══════════════════════════════════════════════════════════
router.put('/:id', auth_1.authenticate, (0, validate_1.validate)(updateCallSchema), async (req, res) => {
    try {
        const existing = await prisma.call.findUnique({ where: { id: req.params.id }, select: { publisherId: true } });
        if (!existing) {
            res.status(404).json({ error: true, message: 'Appel introuvable' });
            return;
        }
        if (existing.publisherId !== req.user.userId) {
            res.status(403).json({ error: true, message: 'Non autorisé' });
            return;
        }
        const call = await prisma.call.update({ where: { id: req.params.id }, data: req.body, select: callSelect });
        res.json(call);
    }
    catch (error) {
        console.error('Update call error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
// ═══════════════════════════════════════════════════════════
// DELETE /api/calls/:id — Supprimer un appel
// ═══════════════════════════════════════════════════════════
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const existing = await prisma.call.findUnique({ where: { id: req.params.id }, select: { publisherId: true } });
        if (!existing) {
            res.status(404).json({ error: true, message: 'Appel introuvable' });
            return;
        }
        if (existing.publisherId !== req.user.userId) {
            res.status(403).json({ error: true, message: 'Non autorisé' });
            return;
        }
        await prisma.call.delete({ where: { id: req.params.id } });
        res.json({ message: 'Appel supprimé avec succès' });
    }
    catch (error) {
        console.error('Delete call error:', error);
        res.status(500).json({ error: true, message: 'Erreur serveur' });
    }
});
exports.default = router;
//# sourceMappingURL=calls.js.map