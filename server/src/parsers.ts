import pdfParse from 'pdf-parse';
import { FileType, DocumentRecord } from './types';

export interface ParseResult {
  fileType: FileType;
  textContent: string;
}

/**
 * Validates file extension and mime type
 */
export function validateFileType(filename: string, mimetype?: string): FileType {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'pdf' || mimetype === 'application/pdf') {
    return 'pdf';
  }
  if (ext === 'csv' || mimetype === 'text/csv' || mimetype === 'application/vnd.ms-excel') {
    return 'csv';
  }
  if (ext === 'txt' || mimetype === 'text/plain') {
    return 'txt';
  }
  throw new Error(`Unsupported document format for "${filename}". Allowed formats: PDF, CSV, TXT.`);
}

/**
 * Extracts raw text from document buffer based on file type
 */
export async function extractDocumentText(
  buffer: Buffer,
  fileType: FileType,
  originalFilename: string
): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error(`Document "${originalFilename}" is empty.`);
  }

  switch (fileType) {
    case 'pdf': {
      try {
        const parsed = await pdfParse(buffer);
        const text = parsed.text ? parsed.text.trim() : '';
        if (!text) {
          return `[PDF "${originalFilename}" contained no extractable textual characters (possibly scanned image)]`;
        }
        return text;
      } catch (err: any) {
        throw new Error(`Failed to parse PDF document "${originalFilename}": ${err.message || err}`);
      }
    }

    case 'csv': {
      try {
        const raw = buffer.toString('utf-8');
        return formatCsvForAnalysis(raw);
      } catch (err: any) {
        throw new Error(`Failed to parse CSV document "${originalFilename}": ${err.message || err}`);
      }
    }

    case 'txt': {
      try {
        const text = buffer.toString('utf-8').trim();
        return text || `[Document "${originalFilename}" is empty]`;
      } catch (err: any) {
        throw new Error(`Failed to parse TXT document "${originalFilename}": ${err.message || err}`);
      }
    }

    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Parses raw CSV into tabular structure formatted for LLM ingestion
 */
export function formatCsvForAnalysis(csvContent: string): string {
  const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return '[Empty CSV Document]';

  return `CSV Tabular Data (${lines.length} rows):\n` + lines.join('\n');
}

/**
 * Formats multiple documents with strict demarcation boundaries.
 * Preserves document boundaries so LLM never bleeds contexts.
 */
export function buildDemarcatedDocumentPayload(documents: DocumentRecord[]): string {
  if (documents.length === 0) {
    return 'NO DOCUMENTS PROVIDED';
  }

  return documents
    .map(doc => {
      return [
        `--- BEGIN DOCUMENT: ${doc.filename} (ID: ${doc.id}, Type: ${doc.file_type.toUpperCase()}) ---`,
        doc.text_content.trim(),
        `--- END DOCUMENT: ${doc.filename} ---`
      ].join('\n');
    })
    .join('\n\n');
}
