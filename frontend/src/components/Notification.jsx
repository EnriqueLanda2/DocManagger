import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const Notification = ({ type = 'info', message, onClose, duration = 4000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const variants = {
        success: {
            container: 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-100',
            icon: <CheckCircle2 size={22} className="text-emerald-500" />,
            accent: 'bg-emerald-500',
            title: 'Éxito'
        },
        error: {
            container: 'bg-rose-50 border-rose-200 text-rose-900 shadow-rose-100',
            icon: <AlertCircle size={22} className="text-rose-500" />,
            accent: 'bg-rose-500',
            title: 'Error'
        },
        warning: {
            container: 'bg-amber-50 border-amber-200 text-amber-900 shadow-amber-100',
            icon: <AlertCircle size={22} className="text-amber-500" />,
            accent: 'bg-amber-500',
            title: 'Atención'
        },
        info: {
            container: 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-indigo-100',
            icon: <Info size={22} className="text-indigo-500" />,
            accent: 'bg-indigo-500',
            title: 'Información'
        }
    };

    const current = variants[type] || variants.info;

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
            <div className={`
        pointer-events-auto
        flex items-stretch min-w-[320px] max-w-md 
        rounded-2xl border bg-white/80 backdrop-blur-md
        shadow-2xl transition-all duration-500 ease-out
        animate-in slide-in-from-right-8 fade-in
        overflow-hidden
        ${current.container}
      `}>
                {/* Lado izquierdo con color de acento */}
                <div className={`w-1.5 ${current.accent} shrink-0`} />

                <div className="flex-1 p-4 flex items-start gap-4">
                    <div className="mt-0.5 shrink-0 bg-white p-2 rounded-xl shadow-sm border border-black/5">
                        {current.icon}
                    </div>

                    <div className="flex-1 flex flex-col justify-center py-1">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">
                            {current.title}
                        </h4>
                        <p className="text-sm font-bold leading-snug">
                            {message}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="shrink-0 p-1.5 hover:bg-black/5 rounded-lg transition-colors group"
                    >
                        <X size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </div>
        </div>
    );
};

Notification.propTypes = {
  type: PropTypes.string,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
};

export default Notification;
