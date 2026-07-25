'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import type { EStatementProps } from './EStatementPDF';
import EStatementPDF from './EStatementPDF';

export default function DownloadStatementButton({ data, monthName, year }: { data: EStatementProps, monthName: string, year: number }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      
      // Load dynamically to avoid SSR issues
      const { pdf } = await import('@react-pdf/renderer');
      
      // Generate blob imperatively instead of using PDFDownloadLink which conflicts with React 19 Reconciler
      const blob = await pdf(<EStatementPDF {...data} />).toBlob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Finsight_Statement_${monthName}_${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal menghasilkan PDF. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      className="btn btn-primary btn-sm" 
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 size={14} className="animate-spin" /> Menyusun PDF...
        </>
      ) : (
        <>
          <Download size={14} /> Unduh E-Statement
        </>
      )}
    </button>
  );
}
