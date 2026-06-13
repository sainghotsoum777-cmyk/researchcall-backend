notepad src\prisma\migrations\003_scraper_fields.sqlimport Parser from 'rss-parser';
import { parse as parseHTML } from 'node-html-parser';
import { prisma } from '../prisma/client';

type CallType = 'communication' | 'publication' | 'colloque' | 'projet' | 'bourse' | 'autre';

const rssParser = new Parser({
  requestOptions: { rejectUnauthorized: false },
  timeout: 15000,
});

const BOT_EMAIL = 'scraper@researchcall.app';

async function getOrCreateBotUser(): Promise<string> {
  let bot = await prisma.user.findUnique({ where: { email: BOT_EMAIL } });
  if (!bot) {
    const bcrypt = await import('bcryptjs');
    bot = await prisma.user.create({
      data: {
        email: BOT_EMAIL,
        passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
        firstName: 'ResearchCall',
        lastName: 'Bot',
        role: 'publisher',
      },
    });
    console.log('Bot utilisateur cree :', bot.id);
  }
  return bot.id;
}

function truncate(text: string, max = 5000): string {
  return text.length > max ? text.slice(0, max) + '...' : text;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function detectType(title: string, description: string): CallType {
  const text = (title + ' ' + description).toLowerCase();
  if (/bourse|fellowship|scholarship/.test(text)) return 'bourse';
  if (/colloque|conference|congres|symposium|seminaire/.test(text)) return 'colloque';
  if (/publication|revue|journal/.test(text)) return 'publication';
  if (/communication|abstract|resume/.test(text)) return 'communication';
  if (/projet|programme|innovation|partenariat/.test(text)) return 'projet';
  return 'autre';
}

function parseDeadline(raw: string | undefined, fallbackDays = 90): Date {
  if (!raw) return new Date(Date.now() + fallbackDays * 86400000);
  const d = new Date(raw);
  if (isNaN(d.getTime())) return new Date(Date.now() + fallbackDays * 86400000);
  if (d < new Date()) return new Date(Date.now() + fallbackDays * 86400000);
  return d;
}

async function upsertCall(
  publisherId: string,
  source: string,
  externalId: string,
  data: {
    title: string;
    description: string;
    type: CallType;
    submissionDeadline: Date;
    externalUrl?: string;
    contactEmail?: string;
    domains?: string[];
    locationCountry?: string;
  },
): Promise<'created' | 'skipped'> {
  const existing = await prisma.call.findFirst({ where: { source, externalId } });
  if (existing) return 'skipped';

  await prisma.call.create({
    data: {
      publisherId,
      source,
      externalId,
      title: truncate(data.title, 255),
      description: truncate(data.description, 5000),
      type: data.type,
      status: 'published' as const,
      submissionDeadline: data.submissionDeadline,
      externalUrl: data.externalUrl,
      contactEmail: data.contactEmail ?? BOT_EMAIL,
      domains: data.domains ?? [],
      locationCountry: data.locationCountry,
    },
  });
  return 'created';
}

async function scrapeAUF(publisherId: string): Promise<number> {
  const feed = await rssParser.parseURL('https://www.auf.org/rss/appels_candidatures/');
  let count = 0;
  for (const item of feed.items ?? []) {
    if (!item.title || !item.link) continue;
    const desc = stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? '');
    const result = await upsertCall(publisherId, 'auf', item.guid ?? item.link, {
      title: item.title,
      description: desc || item.title,
      type: detectType(item.title, desc),
      submissionDeadline: parseDeadline(item.pubDate),
      externalUrl: item.link,
      domains: ['Recherche francophone'],
    });
    if (result === 'created') count++;
  }
  return count;
}

async function scrapeANR(publisherId: string): Promise<number> {
  let feed;
  try {
    feed = await rssParser.parseURL('https://anr.fr/fr/appels/?tx_anrprojects_pi2%5Baction%5D=rss');
  } catch {
    feed = await rssParser.parseURL('https://anr.fr/en/rss-feed-social-media/');
  }
  let count = 0;
  for (const item of feed.items ?? []) {
    if (!item.title || !item.link) continue;
    const text = (item.title + ' ' + (item.contentSnippet ?? '')).toLowerCase();
    if (!/afrique|africain|francoph|partenariat|developpement|cooperation/.test(text)) continue;
    const desc = stripHtml(item.contentSnippet ?? item.content ?? '');
    const result = await upsertCall(publisherId, 'anr', item.guid ?? item.link, {
      title: item.title,
      description: desc || item.title,
      type: detectType(item.title, desc),
      submissionDeadline: parseDeadline(item.pubDate),
      externalUrl: item.link,
      domains: ['Sciences', 'Recherche'],
    });
    if (result === 'created') count++;
  }
  return count;
}

async function scrapeCalenda(publisherId: string): Promise<number> {
  const feeds = [
    'https://calenda.org/rss?q=afrique+francophone',
    'https://calenda.org/rss?q=appel+%C3%A0+communications+afrique',
  ];
  let count = 0;
  for (const url of feeds) {
    try {
      const feed = await rssParser.parseURL(url);
      for (const item of feed.items ?? []) {
        if (!item.title || !item.link) continue;
        const desc = stripHtml(item.contentSnippet ?? item.content ?? '');
        const result = await upsertCall(publisherId, 'calenda', item.guid ?? item.link, {
          title: item.title,
          description: desc || item.title,
          type: detectType(item.title, desc),
          submissionDeadline: parseDeadline(item.pubDate),
          externalUrl: item.link,
          domains: ['Sciences humaines', 'Afrique'],
        });
        if (result === 'created') count++;
      }
    } catch (e) {
      console.warn('Calenda RSS erreur :', (e as Error).message);
    }
  }
  return count;
}

async function scrapeOIF(publisherId: string): Promise<number> {
  try {
    const feed = await rssParser.parseURL('https://appelsaprojets.francophonie.org/fr/rss');
    let count = 0;
    for (const item of feed.items ?? []) {
      if (!item.title || !item.link) continue;
      const desc = stripHtml(item.contentSnippet ?? item.content ?? '');
      const result = await upsertCall(publisherId, 'oif', item.guid ?? item.link, {
        title: item.title,
        description: desc || item.title,
        type: detectType(item.title, desc),
        submissionDeadline: parseDeadline(item.pubDate),
        externalUrl: item.link,
        domains: ['Francophonie', 'Innovation'],
      });
      if (result === 'created') count++;
    }
    return count;
  } catch (e) {
    console.warn('OIF RSS erreur :', (e as Error).message);
    return 0;
  }
}

async function scrapeCAMES(publisherId: string): Promise<number> {
  try {
    const res = await fetch('https://www.lecames.org/appels-a-candidatures/', {
      headers: { 'User-Agent': 'ResearchCallBot/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return 0;
    const html = await res.text();
    const root = parseHTML(html);
    let count = 0;
    const items = root.querySelectorAll('article, .entry, .post, .appel');
    for (const item of items.slice(0, 20)) {
      const titleEl = item.querySelector('h2 a, h3 a, .entry-title a');
      if (!titleEl) continue;
      const title = titleEl.text.trim();
      const link = titleEl.getAttribute('href') ?? '';
      const descEl = item.querySelector('.entry-content, .excerpt, p');
      const desc = descEl?.text.trim() ?? title;
      const result = await upsertCall(publisherId, 'cames', link || title.slice(0, 80), {
        title,
        description: desc,
        type: detectType(title, desc),
        submissionDeadline: parseDeadline(undefined, 60),
        externalUrl: link.startsWith('http') ? link : `https://www.lecames.org${link}`,
        domains: ['Enseignement superieur', 'Afrique'],
        locationCountry: 'Afrique',
      });
      if (result === 'created') count++;
    }
    return count;
  } catch (e) {
    console.warn('CAMES erreur :', (e as Error).message);
    return 0;
  }
}

async function scrapeCODESRIA(publisherId: string): Promise<number> {
  try {
    const res = await fetch('https://codesria.org/category/announcements/call-for-applications/', {
      headers: { 'User-Agent': 'ResearchCallBot/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return 0;
    const html = await res.text();
    const root = parseHTML(html);
    let count = 0;
    const items = root.querySelectorAll('article, .post');
    for (const item of items.slice(0, 20)) {
      const titleEl = item.querySelector('h2 a, h3 a, .entry-title a');
      if (!titleEl) continue;
      const title = titleEl.text.trim();
      const link = titleEl.getAttribute('href') ?? '';
      const descEl = item.querySelector('.entry-content, .excerpt, p');
      const desc = descEl?.text.trim() ?? title;
      const dateEl = item.querySelector('time');
      const result = await upsertCall(publisherId, 'codesria', link || title.slice(0, 80), {
        title,
        description: desc,
        type: detectType(title, desc),
        submissionDeadline: parseDeadline(dateEl?.getAttribute('datetime'), 90),
        externalUrl: link.startsWith('http') ? link : `https://codesria.org${link}`,
        domains: ['Sciences sociales', 'Afrique'],
        locationCountry: 'Afrique',
      });
      if (result === 'created') count++;
    }
    return count;
  } catch (e) {
    console.warn('CODESRIA erreur :', (e as Error).message);
    return 0;
  }
}

export async function scrapeAllSources(): Promise<void> {
  console.log('Demarrage du scraping des sources francophones...');
  const publisherId = await getOrCreateBotUser();

  const results = await Promise.allSettled([
    scrapeAUF(publisherId).then((n) => ({ source: 'AUF', n })),
    scrapeANR(publisherId).then((n) => ({ source: 'ANR', n })),
    scrapeCalenda(publisherId).then((n) => ({ source: 'Calenda', n })),
    scrapeOIF(publisherId).then((n) => ({ source: 'OIF', n })),
    scrapeCAMES(publisherId).then((n) => ({ source: 'CAMES', n })),
    scrapeCODESRIA(publisherId).then((n) => ({ source: 'CODESRIA', n })),
  ]);

  let total = 0;
  for (const r of results) {
    if (r.status === 'fulfilled') {
      console.log(`  OK ${r.value.source} : ${r.value.n} nouveaux appels`);
      total += r.value.n;
    } else {
      console.warn(`  Scraper erreur :`, r.reason?.message ?? r.reason);
    }
  }
  console.log(`Scraping termine - ${total} nouveaux appels importes`);
}