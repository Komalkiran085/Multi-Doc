import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DocumentUpload } from './components/DocumentUpload';
import { PromptSection } from './components/PromptSection';
import { AnalysisResults } from './components/AnalysisResults';
import { DocumentItem, AnalysisResult } from './types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>(
    'Cross-check applicant stated personal monthly income against verified deposits from the bank statement. Calculate variance percentage and flag revenue discrepancies.'
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [notification, setNotification] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const showNotification = (type: 'error' | 'success', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch documents from backend API
  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Failed to load documents');
      const data: DocumentItem[] = await res.json();
      setDocuments(data);
      // Auto-select all documents by default
      setSelectedIds(data.map((d) => d.id));
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(documents.map((d) => d.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleUpload = async (files: FileList | File[]) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload documents');
      }

      showNotification('success', data.message || 'Documents successfully ingested.');
      await fetchDocuments();
    } catch (err: any) {
      showNotification('error', err.message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete document');
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      await fetchDocuments();
      showNotification('success', 'Document deleted.');
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to clear all documents?')) return;
    try {
      const res = await fetch('/api/documents/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset documents');
      setSelectedIds([]);
      setAnalysisResult(null);
      await fetchDocuments();
      showNotification('success', 'Workspace reset.');
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleAnalyze = async () => {
    if (selectedIds.length === 0) {
      showNotification('error', 'Please select at least one document for analysis.');
      return;
    }
    if (!prompt.trim()) {
      showNotification('error', 'Please enter an analysis prompt.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentIds: selectedIds,
          prompt: prompt.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete analysis');
      }

      setAnalysisResult(data);
      showNotification('success', 'Multi-document reconciliation complete!');
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header documentCount={documents.length} />

      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '32px',
          zIndex: 100,
          backgroundColor: notification.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(244, 63, 94, 0.95)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 500,
          fontSize: '0.875rem'
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px', width: '100%', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
          <DocumentUpload
            documents={documents}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onUpload={handleUpload}
            onDelete={handleDelete}
            onReset={handleReset}
            isUploading={isUploading}
          />

          <PromptSection
            prompt={prompt}
            setPrompt={setPrompt}
            selectedCount={selectedIds.length}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Results Panel */}
        {analysisResult && (
          <div style={{ marginTop: '24px' }}>
            <AnalysisResults results={analysisResult} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '16px 32px',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: '#64748b'
      }}>
        Banking Multi-Document Intelligence Workbench • Commercial Underwriting & KYC Audit Pipeline
      </footer>
    </div>
  );
};
