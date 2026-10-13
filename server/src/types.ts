export type FileType = 'pdf' | 'csv' | 'txt';

export interface DocumentRecord {
  id: string;
  filename: string;
  file_type: FileType;
  file_size: number;
  text_content: string;
  created_at: string;
}

export type DocumentListItem = Omit<DocumentRecord, 'text_content'> & {
  previewText?: string;
};

export interface ProvenanceSource {
  documentId?: string;
  documentName: string;
  location?: string;
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

export interface AnalyzeRequest {
  documentIds: string[];
  prompt: string;
}
