"use strict";
// ─────────────────────────────────────────────────────────
// backend/src/prisma/seed.ts — Données de seed
// ResearchCall MVP — Phase 1
//
// Crée des utilisateurs et appels de démonstration
// ancrés dans le contexte académique ouest-africain.
// ─────────────────────────────────────────────────────────
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...\n');
    // ─── Nettoyage ─────────────────────────────────────
    await prisma.notification.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.call.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    // ─── Utilisateurs ──────────────────────────────────
    const passwordHash = await bcryptjs_1.default.hash('Password1', 12);
    const userSeeker = await prisma.user.create({
        data: {
            email: 'chercheur@upgc.edu.ci',
            passwordHash,
            firstName: 'Amadou',
            lastName: 'Koné',
            role: 'both',
            institution: 'Université Péléforo Gon Coulibaly',
            laboratory: 'LARLLESH',
            domains: ['Intelligence Artificielle', 'Sciences de l\'Information et de la Communication', 'Marketing Digital'],
            interests: ['Newsjacking', 'Communication numérique', 'IA et SHS'],
        },
    });
    const userPublisher1 = await prisma.user.create({
        data: {
            email: 'publisher@upgc.edu.ci',
            passwordHash,
            firstName: 'Fatou',
            lastName: 'Traoré',
            role: 'publisher',
            institution: 'Université Péléforo Gon Coulibaly',
            laboratory: 'LARLLESH',
            domains: ['Communication', 'Sociologie'],
        },
    });
    const userPublisher2 = await prisma.user.create({
        data: {
            email: 'revue@univ-ci.edu',
            passwordHash,
            firstName: 'Ibrahim',
            lastName: 'Diallo',
            role: 'publisher',
            institution: 'Université Félix Houphouët-Boigny',
            domains: ['Droit International', 'Sciences Politiques'],
        },
    });
    const userPublisher3 = await prisma.user.create({
        data: {
            email: 'bourses@fsd-afrique.org',
            passwordHash,
            firstName: 'Marie-Claire',
            lastName: 'Bamba',
            role: 'publisher',
            institution: 'Fondation Sciences & Développement',
            domains: ['Économie du Développement', 'Informatique'],
        },
    });
    console.log('✅ Utilisateurs créés:', 4);
    // ─── Appels scientifiques ──────────────────────────
    const calls = await Promise.all([
        prisma.call.create({
            data: {
                publisherId: userPublisher1.id,
                title: 'Colloque International sur l\'IA et les SHS en Afrique',
                type: 'colloque',
                description: 'Ce colloque vise à explorer les intersections entre l\'intelligence artificielle et les sciences humaines et sociales dans le contexte africain. Il réunira des chercheurs, praticiens et décideurs pour examiner comment l\'IA transforme la recherche en SHS, les enjeux éthiques, et les opportunités pour le continent.\n\nLes contributions attendues porteront sur les applications concrètes, les cadres théoriques émergents, et les politiques publiques liées à l\'IA en Afrique francophone.',
                status: 'published',
                thematicAxes: [
                    'IA et éducation en Afrique',
                    'Éthique de l\'IA dans les SHS',
                    'Transformation numérique des universités',
                    'IA et langues africaines',
                ],
                domains: ['Intelligence Artificielle', 'Sciences de l\'Information et de la Communication', 'Communication'],
                language: 'fr',
                submissionDeadline: new Date('2026-06-15'),
                notificationDate: new Date('2026-07-20'),
                eventStartDate: new Date('2026-09-10'),
                eventEndDate: new Date('2026-09-12'),
                locationCity: 'Abidjan',
                locationCountry: 'Côte d\'Ivoire',
                locationModality: 'hybride',
                submissionConditions: 'Articles de 5000 mots max, format APA 7e édition, en français ou anglais. Résumé de 300 mots obligatoire.',
                contactEmail: 'colloque.ia.shs@upgc.edu.ci',
                externalUrl: 'https://colloque-ia-shs.ci',
            },
        }),
        prisma.call.create({
            data: {
                publisherId: userPublisher1.id,
                title: 'Appel à articles — Revue Africaine de Communication Numérique',
                type: 'publication',
                description: 'La Revue Africaine de Communication Numérique lance un appel à contributions pour son numéro spécial consacré aux stratégies de communication digitale des entreprises en Afrique de l\'Ouest.',
                status: 'published',
                thematicAxes: [
                    'Newsjacking et marketing digital',
                    'E-réputation en contexte africain',
                    'Stratégies social media des PME',
                    'Communication institutionnelle digitale',
                ],
                domains: ['Communication', 'Marketing Digital', 'Sciences de l\'Information et de la Communication'],
                language: 'fr',
                submissionDeadline: new Date('2026-07-30'),
                notificationDate: new Date('2026-09-15'),
                locationModality: 'en_ligne',
                submissionConditions: 'Articles de 6000-8000 mots, normes APA 7, soumission en PDF.',
                contactEmail: 'revue.comnum@univ-ci.edu',
                externalUrl: 'https://revue-comnum.org',
            },
        }),
        prisma.call.create({
            data: {
                publisherId: userPublisher3.id,
                title: 'Bourse de recherche doctorale — Fondation Sciences & Développement',
                type: 'bourse',
                description: 'La Fondation Sciences & Développement offre 10 bourses de recherche doctorale pour des thèses portant sur les transitions numériques en Afrique francophone. Montant : 3 000 000 FCFA/an renouvelable 3 ans.',
                status: 'published',
                thematicAxes: [
                    'Transformation digitale',
                    'Gouvernance numérique',
                    'Innovation sociale',
                ],
                domains: ['Informatique', 'Économie du Développement', 'Sciences Politiques'],
                language: 'fr',
                submissionDeadline: new Date('2026-05-31'),
                notificationDate: new Date('2026-07-01'),
                locationCity: 'Dakar',
                locationCountry: 'Sénégal',
                locationModality: 'presentiel',
                submissionConditions: 'Dossier : CV, projet de thèse (10p.), lettre de motivation, 2 lettres de recommandation.',
                contactEmail: 'bourses@fsd-afrique.org',
                externalUrl: 'https://fsd-afrique.org/bourses',
            },
        }),
        prisma.call.create({
            data: {
                publisherId: userPublisher1.id,
                title: 'Journée d\'étude : Femmes et leadership dans l\'espace UEMOA',
                type: 'communication',
                description: 'Cette journée d\'étude invite les chercheur·e·s à interroger les dynamiques de genre dans les sphères de décision au sein de l\'espace UEMOA.',
                status: 'published',
                thematicAxes: [
                    'Leadership féminin',
                    'Genre et gouvernance',
                    'Plafond de verre en Afrique de l\'Ouest',
                ],
                domains: ['Sociologie', 'Gestion des Ressources Humaines', 'Sciences Politiques'],
                language: 'fr',
                submissionDeadline: new Date('2026-05-20'),
                notificationDate: new Date('2026-06-10'),
                eventStartDate: new Date('2026-07-15'),
                eventEndDate: new Date('2026-07-15'),
                locationCity: 'Yamoussoukro',
                locationCountry: 'Côte d\'Ivoire',
                locationModality: 'presentiel',
                submissionConditions: 'Résumé de 500 mots + bibliographie indicative. Communication de 20 min.',
                contactEmail: 'genre.uemoa@uiya.ci',
            },
        }),
        prisma.call.create({
            data: {
                publisherId: userPublisher1.id,
                title: 'Projet de recherche : Cartographie du marketing informel en Côte d\'Ivoire',
                type: 'projet',
                description: 'Appel à participation pour un projet de recherche collaboratif visant à cartographier les pratiques de marketing informel dans les marchés urbains d\'Abidjan et de Korhogo. Financement AUF.',
                status: 'published',
                thematicAxes: [
                    'Marketing informel',
                    'Économie populaire',
                    'Méthodologies de terrain',
                ],
                domains: ['Marketing Digital', 'Économie du Développement', 'Sociologie'],
                language: 'fr',
                submissionDeadline: new Date('2026-06-30'),
                notificationDate: new Date('2026-08-01'),
                eventStartDate: new Date('2026-10-01'),
                eventEndDate: new Date('2027-03-31'),
                locationCity: 'Korhogo',
                locationCountry: 'Côte d\'Ivoire',
                locationModality: 'presentiel',
                submissionConditions: 'CV chercheur + note d\'intention (3p.) + budget prévisionnel.',
                contactEmail: 'recherche.mkt@upgc.edu.ci',
            },
        }),
        prisma.call.create({
            data: {
                publisherId: userPublisher2.id,
                title: 'Conférence Internationale sur le Droit du Numérique en Afrique',
                type: 'colloque',
                description: 'La 3e édition de la CIDNA rassemblera juristes, universitaires et praticiens pour discuter des enjeux juridiques liés au numérique sur le continent africain.',
                status: 'published',
                thematicAxes: [
                    'Protection des données personnelles',
                    'Cybercriminalité',
                    'Régulation des Big Tech',
                    'Droit de l\'IA',
                ],
                domains: ['Droit International', 'Informatique', 'Sciences Politiques'],
                language: 'fr',
                submissionDeadline: new Date('2026-08-15'),
                notificationDate: new Date('2026-09-30'),
                eventStartDate: new Date('2026-11-20'),
                eventEndDate: new Date('2026-11-22'),
                locationCity: 'Rabat',
                locationCountry: 'Maroc',
                locationModality: 'hybride',
                submissionConditions: 'Proposition : 400 mots + 5 mots-clés. Article final : 7000 mots, normes Chicago.',
                contactEmail: 'cidna2026@um5.ac.ma',
                externalUrl: 'https://cidna2026.ma',
            },
        }),
    ]);
    console.log('✅ Appels créés:', calls.length);
    // ─── Favoris de démo ───────────────────────────────
    await prisma.favorite.createMany({
        data: [
            { userId: userSeeker.id, callId: calls[0].id },
            { userId: userSeeker.id, callId: calls[1].id },
        ],
    });
    console.log('✅ Favoris créés: 2');
    // ─── Notifications de démo ─────────────────────────
    await prisma.notification.createMany({
        data: [
            {
                userId: userSeeker.id,
                callId: calls[0].id,
                title: 'Nouvel appel correspondant',
                body: 'Un colloque sur l\'IA et les SHS correspond à vos centres d\'intérêt.',
                type: 'new_call',
                isRead: false,
            },
            {
                userId: userSeeker.id,
                callId: calls[2].id,
                title: 'Rappel deadline',
                body: 'J-30 : Bourse de recherche doctorale — Fondation S&D',
                type: 'deadline_reminder',
                isRead: false,
            },
        ],
    });
    console.log('✅ Notifications créées: 2');
    console.log('\n🎉 Seed terminé avec succès !\n');
    console.log('📧 Comptes de démo :');
    console.log('   chercheur@upgc.edu.ci  / Password1');
    console.log('   publisher@upgc.edu.ci  / Password1');
    console.log('   revue@univ-ci.edu      / Password1');
    console.log('   bourses@fsd-afrique.org / Password1\n');
}
main()
    .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map