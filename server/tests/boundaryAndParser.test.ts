import { describe, it, expect } from 'vitest';
import {
  validateFileType,
  extractDocumentText,
  buildDemarcatedDocumentPayload,
  formatCsvForAnalysis
} from '../src/parsers';
import { executeMockBankingAnalysis } from '../src/aiEngine';
import { DocumentRecord } from '../src/types';

describe('Document Parsing & Boundary Demarcation Pipeline', () => {
  describe('File Format Validation', () => {
    it('accepts valid PDF, CSV, and TXT extensions', () => {
      expect(validateFileType('loan_contract.pdf')).toBe('pdf');
      expect(validateFileType('bank_transactions.csv')).toBe('csv');
      expect(validateFileType('underwriter_notes.txt')).toBe('txt');
    });

    it('rejects unsupported extensions gracefully with clear error', () => {
      expect(() => validateFileType('unsupported_file.exe')).toThrow(
        /Unsupported document format/
      );
      expect(() => validateFileType('malicious_script.sh')).toThrow(
        /Unsupported document format/
      );
    });
  });

  describe('Document Extraction', () => {
    it('extracts TXT content accurately', async () => {
      const buffer = Buffer.from('Applicant: Jane Smith\nMonthly Income: $12,000');
      const text = await extractDocumentText(buffer, 'txt', 'test.txt');
      expect(text).toContain('Applicant: Jane Smith');
      expect(text).toContain('Monthly Income: $12,000');
    });

    it('formats CSV rows into clear tabular structure', async () => {
      const csvData = 'Date,Amount,Type\n2026-01-01,5000,Deposit\n2026-01-15,300,Expense';
      const buffer = Buffer.from(csvData);
      const text = await extractDocumentText(buffer, 'csv', 'statement.csv');
      expect(text).toContain('CSV Tabular Data (3 rows):');
      expect(text).toContain('2026-01-01,5000,Deposit');
    });
  });

  describe('Document Boundary Preservation & Provenance', () => {
    it('demarcates multiple documents strictly with boundary tokens and avoids cross-bleeding', () => {
      const mockDocs: DocumentRecord[] = [
        {
          id: 'doc_1',
          filename: 'loan_application.txt',
          file_type: 'txt',
          file_size: 1024,
          text_content: 'Stated Monthly Salary: $10,000. Address: 742 Elm St.',
          created_at: new Date().toISOString()
        },
        {
          id: 'doc_2',
          filename: 'bank_statement.csv',
          file_type: 'csv',
          file_size: 2048,
          text_content: 'Average Monthly Deposit: $6,500. Registered Address: 104 Willow Way.',
          created_at: new Date().toISOString()
        }
      ];

      const payload = buildDemarcatedDocumentPayload(mockDocs);

      // Verify strict beginning boundary
      expect(payload).toContain('--- BEGIN DOCUMENT: loan_application.txt (ID: doc_1, Type: TXT) ---');
      expect(payload).toContain('--- END DOCUMENT: loan_application.txt ---');

      // Verify second document beginning boundary
      expect(payload).toContain('--- BEGIN DOCUMENT: bank_statement.csv (ID: doc_2, Type: CSV) ---');
      expect(payload).toContain('--- END DOCUMENT: bank_statement.csv ---');

      // Verify content isolation
      expect(payload).toContain('Stated Monthly Salary: $10,000');
      expect(payload).toContain('Average Monthly Deposit: $6,500');
    });

    it('handles empty document list gracefully', () => {
      const payload = buildDemarcatedDocumentPayload([]);
      expect(payload).toBe('NO DOCUMENTS PROVIDED');
    });
  });

  describe('Banking Mock Analysis & Provenance Schema', () => {
    it('generates structured discrepancies with explicit source citations', () => {
      const docs: DocumentRecord[] = [
        {
          id: 'loan_doc',
          filename: 'loan_application.txt',
          file_type: 'txt',
          file_size: 100,
          text_content: 'Loan Application for John Doe',
          created_at: new Date().toISOString()
        },
        {
          id: 'bank_doc',
          filename: 'bank_statement.csv',
          file_type: 'csv',
          file_size: 100,
          text_content: 'Bank Statement for John Doe',
          created_at: new Date().toISOString()
        }
      ];

      const result = executeMockBankingAnalysis(docs, 'Check income discrepancies');

      // Assert schema properties
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('discrepancies');
      expect(result).toHaveProperty('extractedFacts');
      expect(result).toHaveProperty('missingInformation');

      // Assert provenance on discrepancies
      expect(result.discrepancies.length).toBeGreaterThanOrEqual(2);
      for (const disc of result.discrepancies) {
        expect(disc.sourceDocuments.length).toBeGreaterThan(0);
        expect(disc).toHaveProperty('field');
        expect(disc).toHaveProperty('severity');
        expect(['HIGH', 'MEDIUM', 'LOW']).toContain(disc.severity);
      }

      // Assert provenance on extracted facts
      for (const fact of result.extractedFacts) {
        expect(fact.source).toBeTruthy();
        expect(fact.field).toBeTruthy();
      }
    });
  });
});
