"use strict";
// ─────────────────────────────────────────────────────────
// backend/src/services/callService.ts — Logique métier des appels
// ResearchCall MVP — Phase 3
//
// Full-text search PostgreSQL avec :
// - Recherche par tsvector (pondéré : titre A, description B, etc.)
// - Recherche floue par trigrams (pg_trgm) en fallback
// - Score de pertinence combiné
// - Filtres avancés et pagination
// ─────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCalls = searchCalls;
exports.getPersonalizedFeed = getPersonalizedFeed;
exports.getSearchSuggestions = getSearchSuggestions;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ─── Full-Text Search avec Prisma Raw ────────────────────
/**
 * Recherche avancée combinant full-text search et filtres SQL
 *
 * Stratégie de recherche :
 * 1. Si query fournie → full-text search tsvector + score de pertinence
 * 2. Fallback trigram si aucun résultat full-text
 * 3. Filtres SQL standard (type, domain, country, etc.)
 * 4. Tri par pertinence, deadline, ou date de création
 */
async function searchCalls(params) {
    const { search, type, domain, country, language, status = 'published', deadlineAfter, deadlineBefore, modality, sort = 'created_desc', page = 1, limit = 20, } = params;
    const offset = (page - 1) * limit;
    // ─── Construire les clauses WHERE ──────────────────
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    // Statut
    if (status) {
        conditions.push(`c.status = $${paramIndex}::text::"CallStatus"`);
        values.push(status);
        paramIndex++;
    }
    // Type
    if (type) {
        conditions.push(`c.type = $${paramIndex}::text::"CallType"`);
        values.push(type);
        paramIndex++;
    }
    // Domaine
    if (domain) {
        conditions.push(`$${paramIndex} = ANY(c.domains)`);
        values.push(domain);
        paramIndex++;
    }
    // Pays
    if (country) {
        conditions.push(`c.location_country = $${paramIndex}`);
        values.push(country);
        paramIndex++;
    }
    // Langue
    if (language) {
        conditions.push(`c.language = $${paramIndex}`);
        values.push(language);
        paramIndex++;
    }
    // Modalité
    if (modality) {
        conditions.push(`c.location_modality = $${paramIndex}::text::"LocationModality"`);
        values.push(modality);
        paramIndex++;
    }
    // Deadline après
    if (deadlineAfter) {
        conditions.push(`c.submission_deadline >= $${paramIndex}::timestamp`);
        values.push(new Date(deadlineAfter));
        paramIndex++;
    }
    // Deadline avant
    if (deadlineBefore) {
        conditions.push(`c.submission_deadline <= $${paramIndex}::timestamp`);
        values.push(new Date(deadlineBefore));
        paramIndex++;
    }
    // ─── Recherche textuelle ───────────────────────────
    let searchSelect = '';
    let searchCondition = '';
    let searchOrderBy = '';
    if (search && search.trim().length > 0) {
        const searchQuery = search.trim();
        // Construire la tsquery à partir des mots
        const tsQueryWords = searchQuery
            .split(/\s+/)
            .filter((w) => w.length > 1)
            .map((w) => `${w}:*`)
            .join(' & ');
        // Score full-text (tsvector) + score trigram (similarité)
        searchSelect = `,
      ts_rank_cd(c.search_vector, to_tsquery('french_unaccent', $${paramIndex}), 32) AS ft_rank,
      similarity(c.title, $${paramIndex + 1}) AS trgm_score,
      (
        ts_rank_cd(c.search_vector, to_tsquery('french_unaccent', $${paramIndex}), 32) * 2.0 +
        similarity(c.title, $${paramIndex + 1}) * 1.5 +
        similarity(c.description, $${paramIndex + 1}) * 0.5
      ) AS combined_score`;
        // Condition : full-text OU trigram (fallback)
        searchCondition = `AND (
      c.search_vector @@ to_tsquery('french_unaccent', $${paramIndex})
      OR similarity(c.title, $${paramIndex + 1}) > 0.15
      OR similarity(c.description, $${paramIndex + 1}) > 0.1
      OR c.title ILIKE '%' || $${paramIndex + 1} || '%'
    )`;
        values.push(tsQueryWords || searchQuery);
        paramIndex++;
        values.push(searchQuery);
        paramIndex++;
    }
    // ─── Clause WHERE complète ─────────────────────────
    const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')} ${searchCondition}`
        : searchCondition
            ? `WHERE TRUE ${searchCondition}`
            : '';
    // ─── ORDER BY ──────────────────────────────────────
    if (search && sort === 'relevance') {
        searchOrderBy = 'ORDER BY combined_score DESC, c.created_at DESC';
    }
    else {
        switch (sort) {
            case 'deadline_asc':
                searchOrderBy = 'ORDER BY c.submission_deadline ASC';
                break;
            case 'deadline_desc':
                searchOrderBy = 'ORDER BY c.submission_deadline DESC';
                break;
            case 'created_asc':
                searchOrderBy = 'ORDER BY c.created_at ASC';
                break;
            case 'relevance':
                if (search) {
                    searchOrderBy = 'ORDER BY combined_score DESC, c.created_at DESC';
                }
                else {
                    searchOrderBy = 'ORDER BY c.created_at DESC';
                }
                break;
            case 'created_desc':
            default:
                searchOrderBy = 'ORDER BY c.created_at DESC';
                break;
        }
    }
    // ─── Requête COUNT ─────────────────────────────────
    const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM calls c
    LEFT JOIN users u ON c.publisher_id = u.id
    ${whereClause}
  `;
    // ─── Requête principale ────────────────────────────
    const dataQuery = `
    SELECT
      c.id,
      c.publisher_id AS "publisherId",
      c.title,
      c.type,
      c.description,
      c.status,
      c.thematic_axes AS "thematicAxes",
      c.domains,
      c.language,
      c.submission_deadline AS "submissionDeadline",
      c.notification_date AS "notificationDate",
      c.event_start_date AS "eventStartDate",
      c.event_end_date AS "eventEndDate",
      c.location_city AS "locationCity",
      c.location_country AS "locationCountry",
      c.location_modality AS "locationModality",
      c.submission_conditions AS "submissionConditions",
      c.contact_email AS "contactEmail",
      c.external_url AS "externalUrl",
      c.created_at AS "createdAt",
      c.updated_at AS "updatedAt",
      json_build_object(
        'id', u.id,
        'firstName', u.first_name,
        'lastName', u.last_name,
        'institution', u.institution
      ) AS publisher
      ${searchSelect}
    FROM calls c
    LEFT JOIN users u ON c.publisher_id = u.id
    ${whereClause}
    ${searchOrderBy}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
    values.push(limit, offset);
    try {
        // Exécuter les deux requêtes en parallèle
        const [countResult, dataResult] = await Promise.all([
            prisma.$queryRawUnsafe(countQuery, ...values.slice(0, -2)),
            prisma.$queryRawUnsafe(dataQuery, ...values),
        ]);
        const total = countResult[0]?.total || 0;
        // Nettoyer les résultats (supprimer les scores internes)
        const data = dataResult.map((row) => {
            const { ft_rank, trgm_score, combined_score, ...call } = row;
            return call;
        });
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    catch (error) {
        console.error('Full-text search error, falling back to Prisma:', error);
        // Fallback vers la recherche Prisma standard si les extensions ne sont pas installées
        return fallbackSearch(params);
    }
}
// ─── Fallback : recherche Prisma standard ────────────────
async function fallbackSearch(params) {
    const { search, type, domain, country, language, status = 'published', deadlineAfter, sort = 'created_desc', page = 1, limit = 20, } = params;
    const where = {};
    if (status)
        where.status = status;
    if (type)
        where.type = type;
    if (language)
        where.language = language;
    if (country)
        where.locationCountry = country;
    if (domain)
        where.domains = { has: domain };
    if (deadlineAfter)
        where.submissionDeadline = { gte: new Date(deadlineAfter) };
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { domains: { has: search } },
            { thematicAxes: { has: search } },
            { publisher: { institution: { contains: search, mode: 'insensitive' } } },
        ];
    }
    let orderBy = {};
    switch (sort) {
        case 'deadline_asc':
            orderBy = { submissionDeadline: 'asc' };
            break;
        case 'deadline_desc':
            orderBy = { submissionDeadline: 'desc' };
            break;
        case 'created_asc':
            orderBy = { createdAt: 'asc' };
            break;
        default: orderBy = { createdAt: 'desc' };
    }
    const [data, total] = await Promise.all([
        prisma.call.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            include: {
                publisher: { select: { id: true, firstName: true, lastName: true, institution: true } },
                attachments: { select: { id: true, fileName: true, fileUrl: true, fileSize: true, mimeType: true } },
                _count: { select: { favorites: true } },
            },
        }),
        prisma.call.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
// ─── Feed personnalisé ───────────────────────────────────
async function getPersonalizedFeed(userId, page = 1, limit = 20) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { domains: true, interests: true },
    });
    if (!user || user.domains.length === 0) {
        return searchCalls({ sort: 'created_desc', page, limit });
    }
    // Recherche par domaines de l'utilisateur, triée par pertinence
    const where = {
        status: 'published',
        submissionDeadline: { gte: new Date() },
        domains: { hasSome: user.domains },
    };
    const [data, total] = await Promise.all([
        prisma.call.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                publisher: { select: { id: true, firstName: true, lastName: true, institution: true } },
                attachments: { select: { id: true, fileName: true, fileUrl: true, fileSize: true, mimeType: true } },
                _count: { select: { favorites: true } },
            },
        }),
        prisma.call.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
// ─── Suggestions de recherche ────────────────────────────
async function getSearchSuggestions(query) {
    if (!query || query.length < 2)
        return [];
    try {
        const results = await prisma.$queryRaw `
      SELECT DISTINCT title
      FROM calls
      WHERE status = 'published'
        AND (
          similarity(title, ${query}) > 0.15
          OR title ILIKE ${'%' + query + '%'}
        )
      ORDER BY similarity(title, ${query}) DESC
      LIMIT 5
    `;
        return results.map((r) => r.title);
    }
    catch {
        // Fallback sans pg_trgm
        const results = await prisma.call.findMany({
            where: {
                status: 'published',
                title: { contains: query, mode: 'insensitive' },
            },
            select: { title: true },
            take: 5,
        });
        return results.map((r) => r.title);
    }
}
//# sourceMappingURL=callService.js.map