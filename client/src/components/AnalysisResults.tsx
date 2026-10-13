import React, { useState } from 'react';
import { Copy, Check, FileSpreadsheet, ShieldAlert, FileSearch, ListChecks, Activity } from 'lucide-react';
import { AnalysisResult } from '../types';
import { DiscrepancyTable } from './DiscrepancyTable';
import { FactsTable } from './FactsTable';
import { MissingInfoCard } from './MissingInfoCard';

interface AnalysisResultsProps {
  results: AnalysisResult;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ results }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'discrepancies' | 'facts' | 'missing'>('discrepancies');

  const copyToClipboard = () => {
    const formatted = `
================================================================================
BANKING INTELLIGENCE WORKBENCH - AUDIT REPORT
================================================================================
Timestamp: ${results.meta?.timestamp || new Date().toISOString()}
Execution Mode: ${results.meta?.executionMode || 'MOCK_FALLBACK'}
Analyzed Documents Count: ${results.meta?.documentCount || 'N/A'}

EXECUTIVE UNDERWRITING SUMMARY:
${results.summary}

--------------------------------------------------------------------------------
DISCREPANCIES IDENTIFIED (${results.discrepancies.length}):
--------------------------------------------------------------------------------
${results.discrepancies
  .map(
    (d, i) =>
      `${i + 1}. [${d.severity}] ${d.field}
   - Claim: ${d.doc1Value}
   - Evidence: ${d.doc2Value}
   - Sources: ${d.sourceDocuments.join(' vs ')}
   - Note: ${d.explanation}`
  )
  .join('\n\n')}

--------------------------------------------------------------------------------
EXTRACTED KEY FACTS (${results.extractedFacts.length}):
--------------------------------------------------------------------------------
${results.extractedFacts.map((f) => `• ${f.field}: ${f.value} (Source: ${f.source})`).join('\n')}

--------------------------------------------------------------------------------
MISSING INFORMATION / DUE DILIGENCE GAPS:
--------------------------------------------------------------------------------
${results.missingInformation.map((m) => `[ ] ${m}`).join('\n')}
================================================================================
`.trim();

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', marginTop: '24px' }}>
      {/* Top Banner & Copy Action */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={20} color="#38bdf8" />
              Multi-Document Analysis & Reconciliation Report
            </h2>
            {results.meta && (
              <span style={{
                fontSize: '0.72rem',
                backgroundColor: results.meta.executionMode === 'AI_LIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                color: results.meta.executionMode === 'AI_LIVE' ? '#34d399' : '#38bdf8',
                border: `1px solid ${results.meta.executionMode === 'AI_LIVE' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 600
              }}>
                {results.meta.executionMode === 'AI_LIVE' ? 'OpenAI GPT' : 'Deterministic Mock Engine'}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Audited cross-document facts with boundary-preserved citations
          </p>
        </div>

        <button
          onClick={copyToClipboard}
          className="btn-secondary"
          style={{
            backgroundColor: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: copied ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)',
            color: copied ? '#34d399' : '#f8fafc'
          }}
        >
          {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Analysis (Markdown)'}</span>
        </button>
      </div>

      {/* Executive Summary Callout */}
      <div style={{
        backgroundColor: 'rgba(30, 58, 138, 0.15)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '12px',
        padding: '18px 20px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '8px' }}>
          <Activity size={17} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Executive Underwriting Summary
          </span>
        </div>
        <p style={{ color: '#e2e8f0', fontSize: '0.92rem', lineHeight: 1.6 }}>
          {results.summary}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('discrepancies')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'discrepancies' ? '#fb7185' : 'transparent'}`,
            color: activeTab === 'discrepancies' ? '#fb7185' : '#94a3b8',
            padding: '8px 16px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <ShieldAlert size={16} />
          Discrepancies ({results.discrepancies.length})
        </button>

        <button
          onClick={() => setActiveTab('facts')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'facts' ? '#38bdf8' : 'transparent'}`,
            color: activeTab === 'facts' ? '#38bdf8' : '#94a3b8',
            padding: '8px 16px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <FileSearch size={16} />
          Extracted Facts ({results.extractedFacts.length})
        </button>

        <button
          onClick={() => setActiveTab('missing')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'missing' ? '#fbbf24' : 'transparent'}`,
            color: activeTab === 'missing' ? '#fbbf24' : '#94a3b8',
            padding: '8px 16px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <ListChecks size={16} />
          Missing Due Diligence ({results.missingInformation.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'discrepancies' && (
        <div>
          <DiscrepancyTable discrepancies={results.discrepancies} />
        </div>
      )}

      {activeTab === 'facts' && (
        <div>
          <FactsTable facts={results.extractedFacts} />
        </div>
      )}

      {activeTab === 'missing' && (
        <div>
          <MissingInfoCard missingInfo={results.missingInformation} />
        </div>
      )}
    </div>
  );
};
