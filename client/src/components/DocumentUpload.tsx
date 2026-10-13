import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Trash2, CheckSquare, Square, RefreshCw, AlertCircle } from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentUploadProps {
  documents: DocumentItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onUpload: (files: FileList | File[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReset: () => Promise<void>;
  isUploading: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documents,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onUpload,
  onDelete,
  onReset,
  isUploading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setUploadError(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      try {
        await onUpload(e.dataTransfer.files);
      } catch (err: any) {
        setUploadError(err.message || 'Upload failed');
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files.length > 0) {
      try {
        await onUpload(e.target.files);
      } catch (err: any) {
        setUploadError(err.message || 'Upload failed');
      }
      e.target.value = '';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#38bdf8" />
            Ingested Documents ({documents.length})
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Supports PDF, CSV, and TXT files with boundary preservation
          </p>
        </div>

        {documents.length > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {selectedIds.length === documents.length ? (
              <button onClick={onDeselectAll} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                <Square size={13} /> Deselect All
              </button>
            ) : (
              <button onClick={onSelectAll} className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                <CheckSquare size={13} /> Select All
              </button>
            )}
            <button
              onClick={onReset}
              className="btn-secondary"
              title="Clear all documents"
              style={{ padding: '5px 10px', fontSize: '0.75rem', color: '#f87171' }}
            >
              <RefreshCw size={13} /> Reset
            </button>
          </div>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragOver ? '#38bdf8' : 'rgba(255, 255, 255, 0.15)'}`,
          backgroundColor: isDragOver ? 'rgba(56, 189, 248, 0.08)' : 'rgba(15, 23, 42, 0.4)',
          borderRadius: '12px',
          padding: '24px 16px',
          textAlign: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '18px'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.csv,.txt"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={isUploading}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'rgba(56, 189, 248, 0.1)',
            padding: '10px',
            borderRadius: '50%',
            color: '#38bdf8'
          }}>
            <UploadCloud size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
              {isUploading ? 'Ingesting and parsing documents...' : 'Click to upload or drag files here'}
            </span>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
              Accepted formats: <strong style={{ color: '#e2e8f0' }}>.PDF, .CSV, .TXT</strong> (Max 20MB per file)
            </div>
          </div>
        </div>
      </div>

      {uploadError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          backgroundColor: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '8px',
          color: '#fb7185',
          fontSize: '0.8rem',
          marginBottom: '16px'
        }}>
          <AlertCircle size={16} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Document Items List */}
      {documents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '30px 16px',
          color: '#64748b',
          fontSize: '0.875rem'
        }}>
          No documents uploaded yet. Upload sample loan documents or bank statements to begin analysis.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
          {documents.map((doc) => {
            const isSelected = selectedIds.includes(doc.id);
            return (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)'}`,
                  borderRadius: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  <button
                    onClick={() => onToggleSelect(doc.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isSelected ? '#38bdf8' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                  >
                    {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>

                  <span className={`badge-format badge-${doc.file_type}`}>
                    {doc.file_type}
                  </span>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#f8fafc',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {doc.filename}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {formatBytes(doc.file_size)} • Uploaded {new Date(doc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => onDelete(doc.id)}
                    title="Delete document"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
