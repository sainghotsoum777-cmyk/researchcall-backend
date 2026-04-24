"use strict";
// ─────────────────────────────────────────────────────────
// backend/src/services/scheduler.ts — Tâches planifiées
// ResearchCall MVP — Phase 5
//
// Exécute quotidiennement :
// - Rappels de deadline (J-7, J-3, J-1)
// - Marquage automatique des appels expirés
// ─────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = startScheduler;
const notificationService_1 = require("./notificationService");
const INTERVAL_MS = 60 * 60 * 1000; // Vérifier toutes les heures
let lastRunDate = '';
/**
 * Démarre le scheduler de tâches automatiques
 */
function startScheduler() {
    console.log('⏰ Scheduler démarré (vérification horaire)');
    // Exécuter immédiatement au démarrage
    runDailyTasks();
    // Puis toutes les heures
    setInterval(() => {
        const today = new Date().toISOString().split('T')[0];
        // Ne lancer les tâches quotidiennes qu'une fois par jour
        if (today !== lastRunDate) {
            runDailyTasks();
            lastRunDate = today;
        }
    }, INTERVAL_MS);
}
async function runDailyTasks() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n📋 Exécution des tâches quotidiennes — ${today}`);
    try {
        // 1. Marquer les appels expirés
        const expired = await (0, notificationService_1.markExpiredCalls)();
        // 2. Envoyer les rappels de deadline
        const reminders = await (0, notificationService_1.sendDeadlineReminders)();
        console.log(`✅ Tâches terminées : ${expired} expirés, ${reminders} rappels`);
        lastRunDate = today;
    }
    catch (error) {
        console.error('❌ Erreur scheduler:', error);
    }
}
//# sourceMappingURL=scheduler.js.map