import React from 'react';
import { ShieldCheck, Database, Cpu } from 'lucide-react';

interface HeaderProps {
  documentCount: number;
}

export const Header: React.FC<HeaderProps> = ({ documentCount }) => {
  return (
    <header style={{
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      background: 'rgba(8, 12, 22, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '16px 32px'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
          }}>
            <ShieldCheck size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: 700 }}>
                Banking Document Intelligence Workbench
              </h1>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '2px 8px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Underwriting & KYC
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Cross-Document Reconciliation, Discrepancy Auditing & Provenance Verification
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#cbd5e1'
          }}>
            <Database size={15} color="#38bdf8" />
            <span>SQLite Active</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{documentCount} Docs Ingested</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#34d399'
          }}>
            <span className="live-indicator" />
            <Cpu size={14} />
            <span style={{ fontWeight: 600 }}>AI Engine Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
