import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';

interface MissingInfoCardProps {
  missingInfo: string[];
}

export const MissingInfoCard: React.FC<MissingInfoCardProps> = ({ missingInfo }) => {
  if (missingInfo.length === 0) {
    return (
      <div style={{ padding: '16px', color: '#64748b', fontSize: '0.85rem' }}>
        All required verification documents and declarations appear present.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {missingInfo.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: 'rgba(245, 158, 11, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '8px'
          }}
        >
          <div style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            padding: '4px',
            borderRadius: '50%',
            marginTop: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <HelpCircle size={14} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ color: '#fde68a', fontSize: '0.875rem', fontWeight: 500 }}>
              {item}
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '2px' }}>
            Action Required <ArrowRight size={11} />
          </span>
        </div>
      ))}
    </div>
  );
};
