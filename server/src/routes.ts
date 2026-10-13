import { Router, Request, Response } from 'express';
import multer from 'multer';
import {
  saveDocument,
  getAllDocuments,
  getDocumentsByIds,
  getDocumentById,
  deleteDocument,
  deleteAllDocuments
} from './db';
import { validateFileType, extractDocumentText } from './parsers';
import { analyzeDocuments } from './aiEngine';
import { DocumentRecord } from './types';

export const apiRouter = Router();

// Configure multer for memory storage (file buffers)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max per file
    files: 10 // Max 10 files per request
  }
});

/**
 * POST /api/documents/upload
 * Multi-file upload with extraction and SQLite persistence
 */
apiRouter.post(
  '/documents/upload',
  upload.array('files', 10),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files provided for upload.' });
        return;
      }

      const savedDocs: DocumentRecord[] = [];
      const errors: { filename: string; reason: string }[] = [];

      for (const file of files) {
        try {
          const fileType = validateFileType(file.originalname, file.mimetype);
          const extractedText = await extractDocumentText(file.buffer, fileType, file.originalname);

          const docRecord: DocumentRecord = {
            id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            filename: file.originalname,
            file_type: fileType,
            file_size: file.size,
            text_content: extractedText,
            created_at: new Date().toISOString()
          };

          saveDocument(docRecord);
          savedDocs.push(docRecord);
        } catch (err: any) {
          errors.push({
            filename: file.originalname,
            reason: err.message || 'Failed to parse file'
          });
        }
      }

      if (savedDocs.length === 0 && errors.length > 0) {
        res.status(400).json({
          error: 'All uploaded files failed validation or extraction.',
          details: errors
        });
        return;
      }

      res.status(201).json({
        message: `Successfully ingested ${savedDocs.length} document(s).`,
        documents: savedDocs.map(d => ({
          id: d.id,
          filename: d.filename,
          file_type: d.file_type,
          file_size: d.file_size,
          created_at: d.created_at
        })),
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (err: any) {
      console.error('Upload handler error:', err);
      res.status(500).json({ error: err.message || 'Internal server error processing files.' });
    }
  }
);

/**
 * GET /api/documents
 * List all ingested documents
 */
apiRouter.get('/documents', (_req: Request, res: Response): void => {
  try {
    const docs = getAllDocuments();
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to retrieve documents: ${err.message}` });
  }
});

/**
 * GET /api/documents/:id
 * Retrieve single document with full text
 */
apiRouter.get('/documents/:id', (req: Request, res: Response): void => {
  try {
    const doc = getDocumentById(req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }
    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/documents/:id
 * Remove document from SQLite
 */
apiRouter.delete('/documents/:id', (req: Request, res: Response): void => {
  try {
    const deleted = deleteDocument(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }
    res.json({ message: 'Document deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/documents/reset
 * Clear all documents from SQLite database
 */
apiRouter.post('/documents/reset', (_req: Request, res: Response): void => {
  try {
    deleteAllDocuments();
    res.json({ message: 'All documents cleared from database.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/analyze
 * Multi-document comparison and risk analysis
 */
apiRouter.post('/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentIds, prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      res.status(400).json({ error: 'Analysis instruction prompt is required.' });
      return;
    }

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      res.status(400).json({ error: 'Please select at least one document for analysis.' });
      return;
    }

    const documents = getDocumentsByIds(documentIds);

    if (documents.length === 0) {
      res.status(404).json({ error: 'None of the requested documents were found in the database.' });
      return;
    }

    const analysisResult = await analyzeDocuments(documents, prompt.trim());
    res.json(analysisResult);
  } catch (err: any) {
    console.error('Analyze error:', err);
    res.status(500).json({ error: `Analysis failed: ${err.message}` });
  }
});

/**
 * GET /api/health
 */
apiRouter.get('/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Multi-Document Intelligence Workbench API'
  });
});
