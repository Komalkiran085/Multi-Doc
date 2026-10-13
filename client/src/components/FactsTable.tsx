import React from 'react';
import { FileCode, Check } from 'lucide-react';
import { ExtractedFact } from '../types';

interface FactsTableProps {
  facts: ExtractedFact[];
}

export const FactsTable: React.FC<FactsTableProps> = ({ facts }) => {
  if (facts.length === 0) {
    return (
      <div style={{ padding: '16px', color: '#64748b', fontSize: '0.85rem' }}>
        No key facts extracted.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <table className="banking-table">
        <thead>
          <tr>
            <th style={{ width: '30%' }}>Verified Fact / Attribute</th>
            <th style={{ width: '45%' }}>Extracted Value</th>
            <th style={{ width: '25%' }}>Source Provenance</th>
          </tr>
        </thead>
        <tbody>
          {facts.map((fact, idx) => (
            <tr key={idx}>
              <td>
                <div style={{ fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="#34d399" />
                  {fact.field}
                </div>
              </td>
              <td>
                <div style={{ color: '#e2e8f0', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  {fact.value}
                </div>
              </td>
              <td>
                <span className="badge-provenance">
                  <FileCode size={11} /> {fact.source}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
