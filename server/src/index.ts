import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initDb, getAllDocuments, saveDocument } from './db';
import { apiRouter } from './routes';
import { extractDocumentText } from './parsers';
import { DocumentRecord } from './types';

// Load environment variables from .env or root .env
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server (usually port 5173 or 3000)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize SQLite database tables
initDb();

// Auto-seed synthetic banking data if database is empty
async function autoSeedSampleDataIfEmpty() {
  try {
    const existing = getAllDocuments();
    if (existing.length === 0) {
      console.log('[Database] Empty database detected. Auto-seeding synthetic banking documents...');
      const sampleDir = path.resolve(__dirname, '..', '..', 'sample_data');
      
      const loanAppPath = path.join(sampleDir, 'loan_application.txt');
      const bankStmtPath = path.join(sampleDir, 'bank_statement.csv');

      if (fs.existsSync(loanAppPath)) {
        const buffer = fs.readFileSync(loanAppPath);
        const text = await extractDocumentText(buffer, 'txt', 'loan_application.txt');
        saveDocument({
          id: 'doc_sample_loan_application',
          filename: 'loan_application.txt',
          file_type: 'txt',
          file_size: buffer.length,
          text_content: text,
          created_at: new Date(Date.now() - 3600000).toISOString()
        });
        console.log('[Database] Seeded loan_application.txt');
      }

      if (fs.existsSync(bankStmtPath)) {
        const buffer = fs.readFileSync(bankStmtPath);
        const text = await extractDocumentText(buffer, 'csv', 'bank_statement.csv');
        saveDocument({
          id: 'doc_sample_bank_statement',
          filename: 'bank_statement.csv',
          file_type: 'csv',
          file_size: buffer.length,
          text_content: text,
          created_at: new Date().toISOString()
        });
        console.log('[Database] Seeded bank_statement.csv');
      }
    }
  } catch (err: any) {
    console.warn('[Database] Auto-seeding skipped or encountered error:', err.message);
  }
}

autoSeedSampleDataIfEmpty();

// Register API router
app.use('/api', apiRouter);

// Serve static client assets in production
const clientDistPath = path.resolve(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root fallback when running API standalone
  app.get('/', (_req, res) => {
    res.send({
      service: 'Multi-Document Intelligence Workbench API',
      status: 'online',
      version: '1.0.0',
      documentation: '/api/health'
    });
  });
}

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏦 Multi-Document Intelligence Workbench API`);
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`🤖 AI Engine Mode: ${process.env.MOCK_AI === 'true' || !process.env.OPENAI_API_KEY ? 'MOCK_FALLBACK (Deterministic Banking Engine)' : 'LIVE_OPENAI'}`);
  console.log(`=======================================================`);
});

export default app;
