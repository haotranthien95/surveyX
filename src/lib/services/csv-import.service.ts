// Parse CSV buffer into Question[] — mirrors excel.service.ts parseExcelBuffer
import type { Question } from '@/lib/types';

export function parseCSVBuffer(buffer: Buffer): Question[] {
  const text = buffer.toString('utf-8');
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());

  const idIdx = headers.findIndex(h => h === 'id' || h === 'questionid');
  const typeIdx = headers.findIndex(h => h === 'type');
  const enIdx = headers.findIndex(h => h === 'en' || h === 'english' || h === 'englishtext');
  const myIdx = headers.findIndex(h => h === 'my' || h === 'burmese' || h === 'burmesetext' || h === 'myanmar');
  const dimIdx = headers.findIndex(h => h === 'dimension' || h === 'section');
  const subIdx = headers.findIndex(h => h === 'subpillar' || h === 'sub_pillar' || h === 'subdimension');
  const optIdx = headers.findIndex(h => h === 'options');

  if (idIdx === -1 || enIdx === -1) {
    throw new Error('CSV must have at least "id" and "en" (or "english") columns');
  }

  const questions: Question[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const id = cols[idIdx]?.trim();
    if (!id) continue;

    const type = (cols[typeIdx]?.trim() || 'likert') as Question['type'];
    const en = cols[enIdx]?.trim() || '';
    const my = myIdx >= 0 ? cols[myIdx]?.trim() || '' : '';
    const dimension = dimIdx >= 0 ? cols[dimIdx]?.trim() || undefined : undefined;
    const subPillar = subIdx >= 0 ? cols[subIdx]?.trim() || undefined : undefined;

    let options: Question['options'];
    if (optIdx >= 0 && cols[optIdx]?.trim()) {
      try {
        const parsed = JSON.parse(cols[optIdx].trim().replace(/;/g, ','));
        if (Array.isArray(parsed)) {
          options = parsed;
        }
      } catch {
        // ignore malformed options
      }
    }

    questions.push({
      id,
      type,
      en,
      my: my || en, // fallback to English if no Burmese
      dimension: dimension as Question['dimension'],
      subPillar,
      options,
    });
  }

  return questions;
}

// Simple CSV line parser that handles quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result.map(s => s.replace(/^"|"$/g, '').trim());
}
