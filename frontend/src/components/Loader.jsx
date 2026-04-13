import React from 'react';
import PropTypes from 'prop-types';

const Loader = ({ message = 'Cargando...', fullPage = false }) => {
    if (fullPage) {
        return (
            <div className="flex flex-col items-center justify-center p-12 w-full h-screen bg-slate-50/50">
                <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-blue-400 rounded-full animate-[spin_1.5s_linear_infinite]"></div>
                </div>
                <p className="text-slate-600 font-bold text-lg animate-pulse">{message}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 w-full">
            <div className="relative mb-4">
                <div className="w-10 h-10 border-3 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-500 font-semibold text-sm">{message}</p>
        </div>
    );
};

Loader.propTypes = {
  message: PropTypes.string,
  fullPage: PropTypes.bool,
};

export default Loader;
