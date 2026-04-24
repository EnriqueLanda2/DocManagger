import React from 'react';
import { Cloud, ArrowLeft, Home } from 'lucide-react';

const NotFound = ({ onGoHome }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center overflow-hidden relative">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full filter blur-[100px] opacity-15 animate-blob" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500 rounded-full filter blur-[100px] opacity-15 animate-blob animation-delay-3000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500 rounded-full filter blur-[100px] opacity-10 animate-blob animation-delay-5000" />
      </div>

      {/* Card */}
      <div className="relative z-10 bg-slate-800/70 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-12 text-center max-w-md w-11/12 shadow-2xl animate-in zoom-in-90 duration-500">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Cloud size={22} className="text-slate-900" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">DocManager</span>
        </div>

        {/* Error number */}
        <div className="text-8xl font-black leading-none bg-gradient-to-br from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-3 animate-pulse">
          404
        </div>

        {/* Divider */}
        <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mx-auto mb-5" />

        <h1 className="text-2xl font-bold text-slate-100 mb-3">Página no encontrada</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          El recurso que buscas no existe o fue movido.<br />
          Verifica la dirección o regresa al inicio.
        </p>

        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200"
        >
          <Home size={16} />
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default NotFound;
