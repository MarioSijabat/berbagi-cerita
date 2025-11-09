// src/scripts/data/db.js
import { openDB } from 'idb';

const DB_NAME = 'berbagi-cerita-db';
const DB_VERSION = 1;
const STORE_NAME = 'stories';

async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    }
  });
}

export async function saveStories(stories) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  stories.forEach(story => tx.store.put(story));
  await tx.done;
}

export async function getStories() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function deleteStory(id) {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
}