// src/lib/services/csv.service.ts
import Papa from 'papaparse';
import { getStorageAdapter } from '../storage';
import { BlobPreconditionFailedError } from '../storage/blob.adapter';

const MAX_RETRIES = 5;

/**
 * Parse CSV string into typed array, keyed by header name.
 * Never access by index — use column names. (FOUN-03)
 */
export function parseCSV<T extends Record<string, string>>(content: string): T[] {
  if (!content || content.trim() === '') return [];
  const result = Papa.parse<T>(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,  // keep all values as strings for CSV safety
  });
  return result.data;
}

/**
 * Serialize typed array to CSV string with header row.
 */
export function serializeCSV<T extends Record<string, string>>(rows: T[]): string {
  return Papa.unparse(rows, { header: true });
}

/**
 * Read all rows from a named CSV file via StorageAdapter.
 * Returns empty array if file does not exist.
 */
export async function readRows<T extends Record<string, string>>(
  filename: string
): Promise<T[]> {
  const adapter = getStorageAdapter();
  const content = await adapter.read(filename);
  if (!content) return [];
  return parseCSV<T>(content);
}

/**
 * Append a single row to a named CSV file.
 * Uses ETag retry loop to handle concurrent writes on Vercel Blob. (FOUN-02, Pitfall 2)
 */
export async function appendRow(
  filename: string,
  row: Record<string, string>
): Promise<void> {
  const adapter = getStorageAdapter();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const existing = await adapter.read(filename);
    const rows = existing
      ? parseCSV<Record<string, string>>(existing)
      : [];

    rows.push(row);
    const csv = serializeCSV(rows);

    try {
      await adapter.write(filename, csv);
      return;
    } catch (err) {
      if (err instanceof BlobPreconditionFailedError && attempt < MAX_RETRIES - 1) {
        continue;  // retry with fresh content
      }
      throw err;
    }
  }
}
