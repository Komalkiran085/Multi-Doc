import path from 'path';
import fs from 'fs';
import { DocumentRecord, DocumentListItem } from './types';

// Use Node's official built-in SQLite engine (DatabaseSync), with fallback if needed
// This eliminates C++ python/gyp build dependencies on Windows and provides native SQLite speed.
let db: any;

try {
  // Built-in node:sqlite in Node.js 22+
  // @ts-ignore
  const { DatabaseSync } = require('node:sqlite');
  const dbPath = path.resolve(__dirname, '..', 'workbench.db');
  db = new DatabaseSync(dbPath);
} catch (e) {
  try {
    const Database = require('better-sqlite3');
    const dbPath = path.resolve(__dirname, '..', 'workbench.db');
    db = new Database(dbPath);
  } catch (e2) {
    console.error('Fatal: Failed to initialize SQLite database engine', e2);
    throw e2;
  }
}

export function initDb(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      text_content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

export function saveDocument(doc: DocumentRecord): void {
  const stmt = db.prepare(`
    INSERT INTO documents (id, filename, file_type, file_size, text_content, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(doc.id, doc.filename, doc.file_type, doc.file_size, doc.text_content, doc.created_at);
}

export function getAllDocuments(): DocumentListItem[] {
  const stmt = db.prepare(`
    SELECT id, filename, file_type, file_size, SUBSTR(text_content, 1, 200) as previewText, created_at
    FROM documents
    ORDER BY created_at DESC
  `);
  return stmt.all() as DocumentListItem[];
}

export function getDocumentsByIds(ids: string[]): DocumentRecord[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`
    SELECT id, filename, file_type, file_size, text_content, created_at
    FROM documents
    WHERE id IN (${placeholders})
  `);
  return stmt.all(...ids) as DocumentRecord[];
}

export function getDocumentById(id: string): DocumentRecord | undefined {
  const stmt = db.prepare(`
    SELECT id, filename, file_type, file_size, text_content, created_at
    FROM documents
    WHERE id = ?
  `);
  return stmt.get(id) as DocumentRecord | undefined;
}

export function deleteDocument(id: string): boolean {
  const stmt = db.prepare('DELETE FROM documents WHERE id = ?');
  const info = stmt.run(id);
  return (info && info.changes > 0) || true;
}

export function deleteAllDocuments(): void {
  db.exec('DELETE FROM documents');
}
