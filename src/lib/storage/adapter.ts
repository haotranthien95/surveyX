// src/lib/storage/adapter.ts
export interface StorageAdapter {
  read(key: string): Promise<string | null>;
  write(key: string, content: string, etag?: string): Promise<{ etag: string }>;
  exists(key: string): Promise<boolean>;
}
