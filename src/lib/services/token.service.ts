// src/lib/services/token.service.ts
import { randomBytes } from 'crypto';
import { db, schema } from '@/lib/db';
import { eq, and, sql } from 'drizzle-orm';
import type { Token } from '@/lib/types';

function toToken(row: typeof schema.tokens.$inferSelect): Token {
  return {
    token: row.token,
    surveyId: row.surveyId,
    email: row.email,
    status: row.status as Token['status'],
    createdAt: row.createdAt.toISOString(),
    submittedAt: row.submittedAt?.toISOString(),
  };
}

export async function generateToken(surveyId: string, email: string): Promise<string> {
  // Idempotent: reuse existing token for same email+survey
  const [existing] = await db.select().from(schema.tokens)
    .where(and(eq(schema.tokens.surveyId, surveyId), eq(schema.tokens.email, email)));

  if (existing) return existing.token;

  const token = randomBytes(32).toString('hex');
  await db.insert(schema.tokens).values({
    token,
    surveyId,
    email,
    status: 'pending',
  });
  return token;
}

export async function validateToken(token: string, surveyId: string): Promise<Token | null> {
  const [row] = await db.select().from(schema.tokens)
    .where(and(eq(schema.tokens.token, token), eq(schema.tokens.surveyId, surveyId)));

  if (!row) return null;
  return toToken(row);
}

export async function findTokenByValue(token: string): Promise<Token | null> {
  const [row] = await db.select().from(schema.tokens)
    .where(eq(schema.tokens.token, token));

  if (!row) return null;
  return toToken(row);
}

export async function markTokenUsed(token: string, surveyId: string): Promise<void> {
  await db.update(schema.tokens)
    .set({ status: 'submitted', submittedAt: new Date() })
    .where(and(eq(schema.tokens.token, token), eq(schema.tokens.surveyId, surveyId)));
}

export async function listTokens(surveyId: string): Promise<Token[]> {
  const rows = await db.select().from(schema.tokens)
    .where(eq(schema.tokens.surveyId, surveyId))
    .orderBy(schema.tokens.createdAt);
  return rows.map(toToken);
}

export async function countSurveyTokens(surveyId: string): Promise<number> {
  const [result] = await db.select({ count: sql<number>`count(*)::int` })
    .from(schema.tokens)
    .where(eq(schema.tokens.surveyId, surveyId));
  return result?.count ?? 0;
}
