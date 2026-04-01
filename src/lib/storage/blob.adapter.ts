// src/lib/storage/blob.adapter.ts
import { put, head } from '@vercel/blob';
import { BlobPreconditionFailedError } from '@vercel/blob';
import type { StorageAdapter } from './adapter';

export class BlobAdapter implements StorageAdapter {
  async read(key: string): Promise<string | null> {
    try {
      const blob = await head(key);
      const response = await fetch(blob.url);
      return response.ok ? response.text() : null;
    } catch {
      return null;
    }
  }

  async write(key: string, content: string, etag?: string): Promise<{ etag: string }> {
    const result = await put(key, content, {
      access: 'public',
      contentType: 'text/csv',
      allowOverwrite: true,
      ...(etag ? { ifMatch: etag } : {}),
    });
    return { etag: result.url };  // Blob URL acts as version identifier
  }

  async exists(key: string): Promise<boolean> {
    try {
      await head(key);
      return true;
    } catch {
      return false;
    }
  }
}

export { BlobPreconditionFailedError };
