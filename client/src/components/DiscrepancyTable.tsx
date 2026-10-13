import React from 'react';
import { AlertTriangle, FileCode, CheckCircle2, Info } from 'lucide-react';
import { Discrepancy } from '../types';

interface DiscrepancyTableProps {
  discrepancies: Discrepancy[];
}

export const DiscrepancyTable: React.FC<DiscrepancyTableProps> = ({ discrepancies }) => {
  if (discrepancies.length === 0) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '10px',
        color: '#34d399',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <CheckCircle2 size={18} />
        <span>No material discrepancies found across analyzed documents.</span>
      </div>
    );
  }

  const getSeverityBadge = (severity: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (severity) {
      case 'HIGH':
        return (
          <span className="badge-severity-high">
            <AlertTriangle size={12} /> HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="badge-severity-medium">
            <AlertTriangle size={12} /> MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="badge-severity-low">
            <Info size={12} /> LOW
          </span>
        );
    }
  };

  return (
    <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <table className="banking-table">
        <thead>
          <tr>
            <th style={{ width: '18%' }}>Audit Field</th>
            <th style={{ width: '12%' }}>Severity</th>
            <th style={{ width: '35%' }}>Document Values Comparison</th>
            <th style={{ width: '35%' }}>Finding & Underwriting Impact</th>
          </tr>
        </thead>
        <tbody>
          {discrepancies.map((disc, idx) => (
            <tr key={idx}>
              <td>
                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>
                  {disc.field}
                </div>
                <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {disc.sourceDocuments.map((src, sIdx) => (
                    <span key={sIdx} className="badge-provenance">
                      <FileCode size={11} /> {src}
                    </span>
                  ))}
                </div>
              </td>
              <td>{getSeverityBadge(disc.severity)}</td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    borderLeft: '3px solid #38bdf8'
                  }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Primary Claim / Stated
                    </span>
                    <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>
                      {disc.doc1Value}
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'rgba(244, 63, 94, 0.05)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    borderLeft: '3px solid #fb7185'
                  }}>
                    <span style={{ fontSize: '0.72rem', color: '#fb7185', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Counter Evidence / Verified
                    </span>
                    <div style={{ color: '#fecdd3', fontSize: '0.85rem', fontWeight: 500 }}>
                      {disc.doc2Value}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {disc.explanation}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
