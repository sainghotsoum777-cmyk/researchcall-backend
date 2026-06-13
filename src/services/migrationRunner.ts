import { prisma } from '../prisma/client';

export async function runPendingMigrations(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE calls ADD COLUMN IF NOT EXISTS source TEXT, ADD COLUMN IF NOT EXISTS external_id TEXT'
    );
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS calls_source_idx ON calls (source)'
    );
    await prisma.$executeRawUnsafe(
      'CREATE UNIQUE INDEX IF NOT EXISTS calls_source_external_id_key ON calls (source, external_id) WHERE source IS NOT NULL AND external_id IS NOT NULL'
    );
    console.log('Migrations appliquees');
  } catch (err) {
    console.warn('Migration ignoree:', (err as Error).message);
  }
}