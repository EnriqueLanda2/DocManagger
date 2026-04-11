import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import { Cloud, FileText, Eye } from 'lucide-react';
import { getPublicDocument } from '../services/api';

const PAGE_WIDTH_PX = 794;  // A4 at 96dpi
const PAGE_HEIGHT_PX = 1123;
const PAGE_MARGIN_PX = 80;

const PublicViewer = ({ token }) => {
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPublicDocument(token)
      .then(res => setDoc(res.data))
      .catch(() => setError('Este link es inválido o ha expirado.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center max-w-sm mx-4">
          <div className="w-16 h-16 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-rose-400" />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">Link inválido</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const safeContent = DOMPurify.sanitize(doc.content || '');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud size={20} className="text-blue-500" />
            <span className="font-black text-slate-800 text-sm">DocManager <span className="text-blue-500 italic">Pro</span></span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
              <span className="font-bold text-slate-600">{doc.name}</span>
              <span>·</span>
              <span>{doc.owner}</span>
              <span>·</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">{doc.version}</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
              <Eye size={12} /> Solo lectura
            </span>
          </div>
        </div>
      </div>

      {/* Page canvas */}
      <div className="flex-1 overflow-auto py-10 flex justify-center">
        <div
          className="bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-200"
          style={{
            width: PAGE_WIDTH_PX,
            minHeight: PAGE_HEIGHT_PX,
            padding: PAGE_MARGIN_PX,
          }}
        >
          {safeContent ? (
            <div
              className="prose prose-slate max-w-none
                [&_p]:mb-4 [&_p]:leading-[1.7] [&_p]:text-slate-800
                [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:mb-6 [&_h1]:tracking-tight [&_h1]:text-slate-900
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:tracking-tight [&_h2]:text-slate-900
                [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-3 [&_h3]:text-slate-900
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:text-slate-600 [&_blockquote]:pl-4 [&_blockquote]:italic
                [&_img]:max-w-full [&_img]:h-auto [&_img]:my-6 [&_img]:rounded-lg
              "
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />
          ) : (
            <p className="text-slate-300 italic text-center py-16">Este documento está vacío.</p>
          )}
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-400 py-4 uppercase tracking-widest font-bold">
        DocManager Pro · Solo lectura
      </p>
    </div>
  );
};

PublicViewer.propTypes = {
  token: PropTypes.string.isRequired,
};

export default PublicViewer;
