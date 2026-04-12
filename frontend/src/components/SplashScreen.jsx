import React from 'react';
import { Cloud } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center transition-all duration-700">
      <div className="relative">
        {/* Animated Glow Rings */}
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[60px] opacity-20 animate-pulse"></div>
        <div className="absolute inset-0 bg-blue-500 rounded-full blur-[100px] opacity-10 animate-pulse delay-700"></div>

        {/* Logo Container */}
        <div className="relative w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-in zoom-in-50 duration-700">
          <Cloud size={56} className="text-slate-900" />
        </div>
      </div>

      {/* Text Container */}
      <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
        <h1 className="text-3xl font-bold text-white tracking-tight">DocManager</h1>
        <div className="mt-4 flex flex-col items-center">
          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full w-full origin-left animate-[loading_2s_ease-in-out_infinite]"></div>
          </div>
          <p className="text-slate-400 text-sm mt-3 font-medium animate-pulse">Iniciando sistema seguro...</p>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
