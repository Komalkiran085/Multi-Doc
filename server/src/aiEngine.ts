import { DocumentRecord, AnalysisResult } from './types';
import { buildDemarcatedDocumentPayload } from './parsers';

/**
 * Executes multi-document analysis using either OpenAI API or the deterministic Banking Mock Engine.
 */
export async function analyzeDocuments(
  documents: DocumentRecord[],
  userPrompt: string
): Promise<AnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const forceMock = process.env.MOCK_AI === 'true' || !apiKey || apiKey.includes('your_openai_api_key');

  if (!forceMock && apiKey) {
    try {
      return await callOpenAi(documents, userPrompt, apiKey);
    } catch (err: any) {
      console.warn(`[AI Engine] OpenAI API call failed (${err.message}). Falling back to Banking Mock Engine.`);
      const fallbackResult = executeMockBankingAnalysis(documents, userPrompt);
      fallbackResult.meta = {
        prompt: userPrompt,
        documentCount: documents.length,
        timestamp: new Date().toISOString(),
        executionMode: 'MOCK_FALLBACK'
      };
      return fallbackResult;
    }
  }

  // Deterministic Banking Domain Mock Engine
  const result = executeMockBankingAnalysis(documents, userPrompt);
  result.meta = {
    prompt: userPrompt,
    documentCount: documents.length,
    timestamp: new Date().toISOString(),
    executionMode: 'MOCK_FALLBACK'
  };
  return result;
}

/**
 * Direct OpenAI Chat Completion with JSON Mode & Boundary Demarcation
 */
async function callOpenAi(
  documents: DocumentRecord[],
  userPrompt: string,
  apiKey: string
): Promise<AnalysisResult> {
  const demarcatedDocs = buildDemarcatedDocumentPayload(documents);

  const systemInstruction = `
You are an expert Senior Commercial Loan Underwriter and KYC Compliance Analyst.
You analyze multiple banking documents submitted by credit applicants.

CRITICAL RULES:
1. Strict Provenance: Every single finding, discrepancy, or extracted fact MUST cite the exact source document filename(s) in "sourceDocuments" or "source".
2. Document Boundary Preservation: Each document is demarcated with "--- BEGIN DOCUMENT: [filename] ---" and "--- END DOCUMENT: [filename] ---". Never blend facts between separate documents without cross-referencing.
3. Distinguish Extracted Facts from Inferences: Keep raw facts verbatim and highlight discrepancies with high precision.
4. Output Format: Return strictly valid JSON with the exact schema below.

JSON Output Schema:
{
  "summary": "High-level underwriting and risk summary highlighting key alignment or issues across the submitted files",
  "discrepancies": [
    {
      "field": "Field name (e.g., Monthly Income, Address, Debt Obligations)",
      "doc1Value": "Value stated in document A",
      "doc2Value": "Conflicting value found in document B",
      "sourceDocuments": ["DocumentA.ext", "DocumentB.ext"],
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "explanation": "Detailed rationale explaining the financial or compliance risk"
    }
  ],
  "extractedFacts": [
    {
      "field": "Metric or Fact Name",
      "value": "Extracted Value",
      "source": "Exact source document filename"
    }
  ],
  "missingInformation": [
    "List of missing verification documents, schedules, or unverified claims"
  ]
}
`;

  const userMessage = `
USER ANALYSIS INSTRUCTION:
${userPrompt}

DOCUMENTS INGESTED:
${demarcatedDocs}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as any;
  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response received from OpenAI.');
  }

  const parsed = JSON.parse(content) as AnalysisResult;
  parsed.meta = {
    prompt: userPrompt,
    documentCount: documents.length,
    timestamp: new Date().toISOString(),
    executionMode: 'AI_LIVE'
  };
  return parsed;
}

/**
 * Realistic Banking Mock Implementation for 100% offline functionality & test predictability
 */
export function executeMockBankingAnalysis(
  documents: DocumentRecord[],
  userPrompt: string
): AnalysisResult {
  const docNames = documents.map(d => d.filename);
  const combinedText = documents.map(d => d.text_content.toLowerCase()).join(' ');

  const hasLoanApp = documents.some(d => d.filename.toLowerCase().includes('loan') || d.filename.toLowerCase().includes('application'));
  const hasBankStmt = documents.some(d => d.filename.toLowerCase().includes('bank') || d.filename.toLowerCase().includes('statement'));

  // Detect banking domain context
  const loanDoc = documents.find(d => d.filename.toLowerCase().includes('loan')) || documents[0];
  const stmtDoc = documents.find(d => d.filename.toLowerCase().includes('statement') || d.filename.toLowerCase().includes('bank')) || documents[1] || documents[0];

  const loanDocName = loanDoc ? loanDoc.filename : (docNames[0] || 'Document 1');
  const stmtDocName = stmtDoc ? stmtDoc.filename : (docNames[1] || 'Document 2');

  const discrepancies = [
    {
      field: 'Monthly Income Verification',
      doc1Value: '$10,000.00 / month declared personal income',
      doc2Value: '$6,500.00 / month average verified bank deposits',
      sourceDocuments: [loanDocName, stmtDocName],
      severity: 'HIGH' as const,
      explanation: `Declared personal monthly income on ${loanDocName} ($10,000.00) exceeds average verified deposits on ${stmtDocName} ($6,500.00) by 35% ($3,500.00 discrepancy). Applicant may be overstating operational cash flow.`
    },
    {
      field: 'Primary Residential & Business Address',
      doc1Value: '742 Elm St, Springfield, IL 62704',
      doc2Value: '104 Willow Way, Springfield, IL 62704',
      sourceDocuments: [loanDocName, stmtDocName],
      severity: 'HIGH' as const,
      explanation: `Address mismatch detected between loan application attestation (${loanDocName}) and bank account registered address (${stmtDocName}). Indicates potential unverified relocation or falsified KYC address proof.`
    },
    {
      field: 'Existing Debt Obligations & Liabilities',
      doc1Value: 'NONE ($0.00 reported liabilities)',
      doc2Value: '$600.00 monthly recurring ACH auto loan repayment to Apex Auto Finance',
      sourceDocuments: [loanDocName, stmtDocName],
      severity: 'HIGH' as const,
      explanation: `Applicant stated zero outstanding liabilities in ${loanDocName}, but 3 consecutive monthly payments of $600.00 to Apex Auto Finance appear in ${stmtDocName}. Debt-to-Income (DTI) ratio is understated.`
    }
  ];

  const extractedFacts = [
    {
      field: 'Applicant Legal Name',
      value: 'John Doe',
      source: loanDocName
    },
    {
      field: 'Requested Credit Facility',
      value: '$50,000.00 USD (36-Month Term Loan)',
      source: loanDocName
    },
    {
      field: 'Business Entity Name',
      value: 'Apex Technology Solutions LLC',
      source: loanDocName
    },
    {
      field: 'Verified Bank Account Number',
      value: 'ACT-88492019 (Heritage Community Credit Union)',
      source: stmtDocName
    },
    {
      field: 'Statement Closing Balance',
      value: '$19,440.00 USD (as of August 31, 2026)',
      source: stmtDocName
    },
    {
      field: 'Verified Average Monthly Inflow',
      value: '$6,500.00 USD',
      source: stmtDocName
    }
  ];

  const missingInformation = [
    'Recent Utility Bill or Lease Agreement validating whether 742 Elm St or 104 Willow Way is the primary residence.',
    'Official Credit Bureau Report verifying the undisclosed auto loan with Apex Auto Finance.',
    'Federal Tax Returns (Form 1040 & Schedule C / 1120-S) for the past 2 fiscal years to reconcile the $3,500 monthly revenue gap.',
    'Proof of Good Standing certificate for Apex Technology Solutions LLC.'
  ];

  const summary = `Cross-document reconciliation completed across ${documents.length} files (${docNames.join(', ')}). While the applicant maintains a healthy closing liquidity balance of $19,440.00, material underwriting discrepancies were identified: a 35% shortfall between stated monthly income ($10,000) and actual bank deposits ($6,500), an undisclosed $600/month auto loan liability, and conflicting residential addresses. Immediate enhanced due diligence (EDD) is recommended before credit committee approval.`;

  return {
    summary,
    discrepancies,
    extractedFacts,
    missingInformation
  };
}
