import React from 'react';
import { Sparkles, Play, BookOpen, Layers } from 'lucide-react';

interface PromptSectionProps {
  prompt: string;
  setPrompt: (p: string) => void;
  selectedCount: number;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const PromptSection: React.FC<PromptSectionProps> = ({
  prompt,
  setPrompt,
  selectedCount,
  onAnalyze,
  isAnalyzing
}) => {
  const presets = [
    {
      label: 'Cross-check Stated Income vs Bank Deposits',
      text: 'Cross-check applicant stated personal monthly income against verified deposits from the bank statement. Calculate variance percentage and flag revenue discrepancies.'
    },
    {
      label: 'Identify Address Discrepancies & Missing KYC',
      text: 'Identify inconsistencies in applicant residential and business addresses between the application form and supporting bank statement. Extract missing KYC identity proofs.'
    },
    {
      label: 'Audit Undisclosed Debt Obligations',
      text: 'Extract all declared debt liabilities from the application and cross-reference against recurring debit transactions and auto loans in bank records. Highlight undisclosed liabilities.'
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#38bdf8" />
            Underwriting Analysis Instruction
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Provide custom analysis guidelines or click an industry preset
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          color: selectedCount >= 1 ? '#34d399' : '#f59e0b',
          backgroundColor: selectedCount >= 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          padding: '4px 10px',
          borderRadius: '6px',
          border: `1px solid ${selectedCount >= 1 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
        }}>
          <Layers size={13} />
          <span>{selectedCount} Document{selectedCount !== 1 ? 's' : ''} Selected</span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
        <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <BookOpen size={13} /> Presets:
        </span>
        {presets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            className="btn-pill"
            onClick={() => setPrompt(preset.text)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        placeholder="Enter specific audit instructions (e.g., 'Compare income figures, check residential addresses for discrepancies, extract key dates and loan amounts...')"
        style={{
          width: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '14px',
          color: '#f8fafc',
          fontSize: '0.9rem',
          fontFamily: 'var(--font-sans)',
          resize: 'vertical',
          outline: 'none',
          marginBottom: '16px'
        }}
        onFocus={(e) => (e.target.style.borderColor = 'rgba(56, 189, 248, 0.5)')}
        onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
      />

      {/* Action Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || selectedCount === 0 || !prompt.trim()}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: '0.95rem' }}
        >
          {isAnalyzing ? (
            <>
              <span className="live-indicator" style={{ backgroundColor: '#ffffff', boxShadow: 'none' }} />
              Executing Multi-Document Intelligence Pipeline...
            </>
          ) : (
            <>
              <Play size={16} fill="#ffffff" />
              Analyze Selected Documents ({selectedCount})
            </>
          )}
        </button>
      </div>
    </div>
  );
};
