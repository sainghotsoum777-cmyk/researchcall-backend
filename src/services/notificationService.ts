// ─────────────────────────────────────────────────────────
// backend/src/services/notificationService.ts — Push notifications
// ResearchCall MVP — Phase 5
//
// - Envoi de notifications push via Expo Push API
// - Notification automatique sur nouveaux appels (par domaine)
// - Rappels de deadline (J-7, J-3, J-1) pour les favoris
// - Notification de modération au publicateur
// ─────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// ─── Types ───────────────────────────────────────────────

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

// ─── Envoi via Expo Push API ─────────────────────────────

async function sendPushNotifications(messages: PushMessage[]): Promise<void> {
  if (messages.length === 0) return;

  // Envoyer par lots de 100 (limite Expo)
  const chunks: PushMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      if (!response.ok) {
        console.error('Push API error:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Push send error:', error);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Notifier les chercheurs d'un nouvel appel correspondant
// ═══════════════════════════════════════════════════════════

export async function notifyNewCall(callId: string): Promise<number> {
  const call = await prisma.call.findUnique({
    where: { id: callId },
    select: { id: true, title: true, domains: true, type: true },
  });

  if (!call) return 0;

  // Trouver les utilisateurs dont les domaines correspondent
  const matchingUsers = await prisma.user.findMany({
    where: {
      pushToken: { not: null },
      domains: { hasSome: call.domains },
      // Ne pas notifier le publicateur lui-même
      id: { not: call.id },
    },
    select: { id: true, pushToken: true },
  });

  if (matchingUsers.length === 0) return 0;

  const title = 'Nouvel appel correspondant 🔬';
  const body = call.title.length > 80
    ? call.title.substring(0, 77) + '…'
    : call.title;

  // Créer les notifications en BDD
  await prisma.notification.createMany({
    data: matchingUsers.map((user) => ({
      userId: user.id,
      callId: call.id,
      title,
      body,
      type: 'new_call' as const,
    })),
  });

  // Envoyer les push notifications
  const messages: PushMessage[] = matchingUsers
    .filter((u) => u.pushToken)
    .map((user) => ({
      to: user.pushToken!,
      title,
      body,
      data: { callId: call.id, type: 'new_call' },
      sound: 'default',
      channelId: 'default',
    }));

  await sendPushNotifications(messages);

  console.log(`📢 ${matchingUsers.length} utilisateurs notifiés pour: ${call.title}`);
  return matchingUsers.length;
}

// ═══════════════════════════════════════════════════════════
// Rappels de deadline pour les appels en favoris
// ═══════════════════════════════════════════════════════════

export async function sendDeadlineReminders(): Promise<number> {
  const now = new Date();
  let totalSent = 0;

  // Rappels pour J-7, J-3, J-1
  for (const daysBeforeDeadline of [7, 3, 1]) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + daysBeforeDeadline);

    // Trouver les appels dont la deadline est dans X jours
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const callsWithFavorites = await prisma.call.findMany({
      where: {
        status: 'published',
        submissionDeadline: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        title: true,
        submissionDeadline: true,
        favorites: {
          select: {
            user: {
              select: { id: true, pushToken: true },
            },
          },
        },
      },
    });

    for (const call of callsWithFavorites) {
      const users = call.favorites.map((f) => f.user).filter((u) => u.pushToken);
      if (users.length === 0) continue;

      const title = `⏰ Rappel J-${daysBeforeDeadline}`;
      const body = call.title.length > 70
        ? call.title.substring(0, 67) + '…'
        : call.title;

      // Vérifier qu'on n'a pas déjà envoyé ce rappel
      const existingReminders = await prisma.notification.count({
        where: {
          callId: call.id,
          type: 'deadline_reminder',
          title: { contains: `J-${daysBeforeDeadline}` },
          createdAt: { gte: startOfDay },
        },
      });

      if (existingReminders > 0) continue;

      // Créer en BDD
      await prisma.notification.createMany({
        data: users.map((user) => ({
          userId: user.id,
          callId: call.id,
          title,
          body,
          type: 'deadline_reminder' as const,
        })),
      });

      // Push
      const messages: PushMessage[] = users.map((user) => ({
        to: user.pushToken!,
        title,
        body,
        data: { callId: call.id, type: 'deadline_reminder' },
        sound: 'default',
        channelId: 'default',
      }));

      await sendPushNotifications(messages);
      totalSent += users.length;
    }
  }

  if (totalSent > 0) {
    console.log(`⏰ ${totalSent} rappels de deadline envoyés`);
  }
  return totalSent;
}

// ═══════════════════════════════════════════════════════════
// Notification de modération au publicateur
// ═══════════════════════════════════════════════════════════

export async function notifyModerationResult(
  callId: string,
  approved: boolean,
): Promise<void> {
  const call = await prisma.call.findUnique({
    where: { id: callId },
    select: {
      id: true,
      title: true,
      publisher: { select: { id: true, pushToken: true } },
    },
  });

  if (!call) return;

  const title = approved ? '✅ Appel approuvé' : '❌ Appel refusé';
  const body = `Votre appel "${call.title.substring(0, 50)}${call.title.length > 50 ? '…' : ''}" a été ${approved ? 'approuvé et publié' : 'refusé par la modération'}.`;

  // BDD
  await prisma.notification.create({
    data: {
      userId: call.publisher.id,
      callId: call.id,
      title,
      body,
      type: 'moderation_result',
    },
  });

  // Push
  if (call.publisher.pushToken) {
    await sendPushNotifications([{
      to: call.publisher.pushToken,
      title,
      body,
      data: { callId: call.id, type: 'moderation_result' },
      sound: 'default',
    }]);
  }
}

// ═══════════════════════════════════════════════════════════
// Marquer les appels expirés automatiquement
// ═══════════════════════════════════════════════════════════

export async function markExpiredCalls(): Promise<number> {
  const result = await prisma.call.updateMany({
    where: {
      status: 'published',
      submissionDeadline: { lt: new Date() },
    },
    data: { status: 'expired' },
  });

  if (result.count > 0) {
    console.log(`📅 ${result.count} appels marqués comme expirés`);
  }
  return result.count;
}
