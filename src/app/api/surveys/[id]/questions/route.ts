// src/app/api/surveys/[id]/questions/route.ts
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
import type { SessionData } from '@/lib/auth';
import { parseExcelBuffer } from '@/lib/services/excel.service';
import { parseCSVBuffer } from '@/lib/services/csv-import.service';
import { saveQuestions, getQuestions } from '@/lib/services/survey.service';
import { GPTW_QUESTIONS, OPEN_ENDED_QUESTIONS, DEMOGRAPHIC_FIELDS } from '@/lib/constants';
import type { Question } from '@/lib/types';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return Boolean(session.token);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const questions = await getQuestions(id);
  return Response.json({ questions });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const contentType = request.headers.get('content-type') || '';

  // JSON body — manual questions or use defaults
  if (contentType.includes('application/json')) {
    const body = await request.json();

    // Use default GPTW questions
    if (body.useDefaults === true) {
      const allQuestions: Question[] = [...GPTW_QUESTIONS, ...OPEN_ENDED_QUESTIONS, ...DEMOGRAPHIC_FIELDS];
      await saveQuestions(id, allQuestions);
      return Response.json({ questions: allQuestions, count: allQuestions.length });
    }

    // Manual questions array
    if (Array.isArray(body.questions)) {
      const questions = body.questions as Question[];
      await saveQuestions(id, questions);
      return Response.json({ questions, count: questions.length });
    }

    return Response.json({ error: 'Invalid body. Send { useDefaults: true } or { questions: [...] }' }, { status: 400 });
  }

  // FormData — file upload (Excel or CSV)
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return Response.json({ error: 'No file provided.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name.toLowerCase();

  let questions: Question[];

  if (fileName.endsWith('.csv')) {
    try {
      questions = parseCSVBuffer(buffer);
    } catch (e) {
      return Response.json({ error: e instanceof Error ? e.message : 'Failed to parse CSV' }, { status: 400 });
    }
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    questions = await parseExcelBuffer(buffer);
  } else {
    return Response.json({ error: 'File must be .csv, .xlsx, or .xls' }, { status: 400 });
  }

  if (questions.length === 0) {
    return Response.json({ error: 'No valid questions found in file' }, { status: 400 });
  }

  await saveQuestions(id, questions);
  return Response.json({ questions, count: questions.length });
}
