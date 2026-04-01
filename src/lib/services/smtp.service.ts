// src/lib/services/smtp.service.ts
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import type { SmtpSettings } from '@/lib/types';

export async function getSmtpSettings(): Promise<SmtpSettings | null> {
  const [row] = await db.select().from(schema.smtpSettings).where(eq(schema.smtpSettings.id, 1));
  if (!row) return null;
  return {
    host: row.host,
    port: row.port,
    username: row.username,
    password: row.password,
    fromAddress: row.fromAddress,
    fromName: row.fromName,
  };
}

export async function saveSmtpSettings(settings: SmtpSettings): Promise<void> {
  const existing = await getSmtpSettings();
  if (existing) {
    await db.update(schema.smtpSettings).set({
      host: settings.host,
      port: settings.port,
      username: settings.username,
      password: settings.password,
      fromAddress: settings.fromAddress,
      fromName: settings.fromName,
    }).where(eq(schema.smtpSettings.id, 1));
  } else {
    await db.insert(schema.smtpSettings).values({
      id: 1,
      host: settings.host,
      port: settings.port,
      username: settings.username,
      password: settings.password,
      fromAddress: settings.fromAddress,
      fromName: settings.fromName,
    });
  }
}
