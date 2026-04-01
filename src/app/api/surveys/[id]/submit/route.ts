// src/app/api/surveys/[id]/submit/route.ts
// Public route — no admin session auth. Authenticated by token in body.
import { validateToken, markTokenUsed } from '@/lib/services/token.service';
import { getQuestions } from '@/lib/services/survey.service';
import { db, schema } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: surveyId } = await params;

  let body: { token?: string; answers?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.token) {
    return Response.json({ error: 'Missing token' }, { status: 400 });
  }
  if (!body.answers || typeof body.answers !== 'object') {
    return Response.json({ error: 'Missing answers' }, { status: 400 });
  }

  // Validate token
  const tokenRow = await validateToken(body.token, surveyId);
  if (!tokenRow) {
    return Response.json({ error: 'Invalid or already-used token' }, { status: 410 });
  }

  // Build complete answers object with all question IDs
  const questions = await getQuestions(surveyId);
  const allQuestionIds = questions.map(q => q.id);

  const answers: Record<string, string> = {};
  for (const id of allQuestionIds) {
    answers[id] = '';
  }
  for (const [id, value] of Object.entries(body.answers)) {
    answers[id] = value;
  }

  // Persist response FIRST, then invalidate token (ordering critical)
  await db.insert(schema.responses).values({
    surveyId,
    token: body.token,
    email: tokenRow.email,
    answers,
  });
  await markTokenUsed(body.token, surveyId);

  return Response.json({ success: true });
}
