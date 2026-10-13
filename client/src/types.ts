export type FileType = 'pdf' | 'csv' | 'txt';

export interface DocumentItem {
  id: string;
  filename: string;
  file_type: FileType;
  file_size: number;
  previewText?: string;
  created_at: string;
}

export interface Discrepancy {
  field: string;
  doc1Value: string;
  doc2Value: string;
  sourceDocuments: string[];
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
}

export interface ExtractedFact {
  field: string;
  value: string;
  source: string;
}

export interface AnalysisResult {
  summary: string;
  discrepancies: Discrepancy[];
  extractedFacts: ExtractedFact[];
  missingInformation: string[];
  meta?: {
    prompt: string;
    documentCount: number;
    timestamp: string;
    executionMode: 'AI_LIVE' | 'MOCK_FALLBACK';
  };
}
