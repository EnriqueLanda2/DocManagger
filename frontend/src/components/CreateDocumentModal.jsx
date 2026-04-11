import React from 'react';
import PropTypes from 'prop-types';
import { Plus } from 'lucide-react';

const CreateDocumentModal = ({ show, onClose, onSubmit, name, setName }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center bg-slate-50/50 border-b border-slate-100">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-100 rotate-6" >
            <Plus size={32} strokeWidth={3} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Nuevo Documento</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">Dale un nombre épico a tu nuevo proyecto.</p>
        </div>
        <form onSubmit={onSubmit} className="p-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="create-doc-name" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Nombre del Archivo</label>
              <input
                id="create-doc-name"
                type="text"
                autoFocus
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                placeholder="Ej. Plan de Negocios 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4 justify-end mt-10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-xs font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-4 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest active:scale-95"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CreateDocumentModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  setName: PropTypes.func.isRequired,
};

export default CreateDocumentModal;
