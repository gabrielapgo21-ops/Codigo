import { GenerationRecord } from '../types';

const DB_NAME = 'codigo-animate';
const DB_VERSION = 1;
const STORE_VIDEOS = 'videos';
const META_KEY = 'codigo-animate:gallery';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_VIDEOS)) {
        db.createObjectStore(STORE_VIDEOS);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putBlob(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_VIDEOS, 'readwrite');
    tx.objectStore(STORE_VIDEOS).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getBlob(id: string): Promise<Blob | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_VIDEOS, 'readonly');
    const req = tx.objectStore(STORE_VIDEOS).get(id);
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function deleteBlob(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_VIDEOS, 'readwrite');
    tx.objectStore(STORE_VIDEOS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function readMeta(): GenerationRecord[] {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMeta(records: GenerationRecord[]): void {
  localStorage.setItem(META_KEY, JSON.stringify(records));
}

export async function saveGeneration(
  record: GenerationRecord,
  videoBlob: Blob,
): Promise<void> {
  await putBlob(record.id, videoBlob);
  const records = readMeta();
  records.unshift(record);
  writeMeta(records.slice(0, 50));
}

export function listGenerations(): GenerationRecord[] {
  return readMeta();
}

export async function getVideoBlob(id: string): Promise<Blob | undefined> {
  return getBlob(id);
}

export async function deleteGeneration(id: string): Promise<void> {
  await deleteBlob(id);
  const records = readMeta().filter((r) => r.id !== id);
  writeMeta(records);
}
