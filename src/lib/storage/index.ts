// src/lib/storage/index.ts
import { LocalAdapter } from './local.adapter';
import { BlobAdapter } from './blob.adapter';
import type { StorageAdapter } from './adapter';

let adapter: StorageAdapter | undefined;

export function getStorageAdapter(): StorageAdapter {
  if (!adapter) {
    adapter = process.env.NODE_ENV === 'production'
      ? new BlobAdapter()
      : new LocalAdapter();
  }
  return adapter;
}

export type { StorageAdapter };
