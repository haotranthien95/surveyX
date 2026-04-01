// src/lib/storage/local.adapter.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import type { StorageAdapter } from './adapter';

const DEFAULT_DATA_DIR = path.join(process.cwd(), 'data');

export class LocalAdapter implements StorageAdapter {
  private dataDir: string;

  constructor(dataDir: string = DEFAULT_DATA_DIR) {
    this.dataDir = dataDir;
  }

  async read(key: string): Promise<string | null> {
    try {
      return await fs.readFile(path.join(this.dataDir, key), 'utf-8');
    } catch {
      return null;
    }
  }

  async write(key: string, content: string): Promise<{ etag: string }> {
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.writeFile(path.join(this.dataDir, key), content, 'utf-8');
    return { etag: Date.now().toString() };
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.dataDir, key));
      return true;
    } catch {
      return false;
    }
  }
}
