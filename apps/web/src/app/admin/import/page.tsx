'use client';

import { useRef, useState } from 'react';
import styles from './import.module.scss';

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
}

const TEMPLATE_CSV = `title,slug,brand,description,basePriceCents,categoryName,imageUrl,isActive
Air Max 90,air-max-90,Nike,Classic running shoe,14999,Sneakers,https://example.com/airmax90.jpg,true
Jordan 1 High,jordan-1-high,Nike,Iconic basketball shoe,18999,Basketball,,true`;

export default function AdminImportPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState<string[][]>([]);
  const [csvText, setCsvText] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadFile = (file: File) => {
    if (!file.name.endsWith('.csv')) { setError('Please upload a .csv file'); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      const lines = text.split('\n').filter(Boolean).slice(0, 6);
      setPreview(lines.map((l) => l.split(',')));
      setError('');
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const handleImport = async () => {
    if (!csvText) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/catalog/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: csvText,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? `HTTP ${res.status}`);
      }
      const data: ImportResult = await res.json();
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bulk Import Products</h1>
        <button className="btn btn--ghost btn--sm" onClick={downloadTemplate}>
          Download Template CSV
        </button>
      </div>

      <p className={styles.desc}>
        Upload a CSV file to create or update products in bulk. Existing products with matching slugs will be updated.
      </p>

      <div
        className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".csv" className={styles.fileInput} onChange={handleFileChange} />
        <div className={styles.dropIcon}>📄</div>
        {fileName ? (
          <p className={styles.dropText}><strong>{fileName}</strong> loaded</p>
        ) : (
          <>
            <p className={styles.dropText}>Drag & drop a CSV file here, or click to browse</p>
            <p className={styles.dropHint}>Supported format: .csv with UTF-8 encoding</p>
          </>
        )}
      </div>

      {preview.length > 0 && (
        <div className={styles.previewWrap}>
          <h3 className={styles.previewTitle}>Preview (first {preview.length} rows)</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>{preview[0].map((h, i) => <th key={i}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {preview.slice(1).map((row, ri) => (
                  <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell || '—'}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {csvText && !result && (
        <button className="btn btn--primary" onClick={handleImport} disabled={loading}>
          {loading ? 'Importing…' : 'Import Products'}
        </button>
      )}

      {result && (
        <div className={styles.result}>
          <h3 className={styles.resultTitle}>Import Complete</h3>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue} style={{ color: '#22c55e' }}>{result.created}</span>
              <span className={styles.statLabel}>Created</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue} style={{ color: '#3b82f6' }}>{result.updated}</span>
              <span className={styles.statLabel}>Updated</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue} style={{ color: '#f59e0b' }}>{result.skipped}</span>
              <span className={styles.statLabel}>Skipped</span>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className={styles.errorList}>
              <h4>Errors ({result.errors.length})</h4>
              {result.errors.map((e, i) => (
                <p key={i} className={styles.errorItem}>Row {e.row}: {e.message}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
