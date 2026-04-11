import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  History,
  Users,
  Save,
  ShieldCheck,
  Lock,
  Edit3,
  Eye,
  User,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';

const Editor = ({
  activeDoc,
  currentText,
  setCurrentText,
  isLockedByMe,
  lockMessage,
  isSaving,
  showHistory,
  setShowHistory,
  showPermissionsModal,
  setShowPermissionsModal,
  showVersionModal,
  setShowVersionModal,
  versionNote,
  setVersionNote,
  onBack,
  onSaveVersion,
  onRestoreVersion,
  onUpdateDocName,
  hasUnsavedChanges
}) => {
  const [editingName, setEditingName] = useState(false);
  const [docName, setDocName] = useState(activeDoc?.name || '');
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitAction, setExitAction] = useState(null);

  useEffect(() => {
    if (activeDoc) {
      setDocName(activeDoc.name);
    }
  }, [activeDoc]);

  const handleNameSubmit = () => {
    if (docName.trim() && docName !== activeDoc?.name) {
      onUpdateDocName(docName.trim());
    } else {
      setDocName(activeDoc?.name || '');
    }
    setEditingName(false);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setDocName(activeDoc?.name || '');
      setEditingName(false);
    }
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges && isLockedByMe) {
      setExitAction('back');
      setShowExitModal(true);
    } else {
      onBack();
    }
  };

  const handleExitModalAction = async (action) => {
    setShowExitModal(false);
    if (action === 'save') {
      setShowVersionModal(true);
    } else if (action === 'discard') {
      onBack();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-5">
          <button onClick={handleBackClick} className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><ArrowLeft size={20} /></button>
          <div>
            <div className="flex items-center gap-2">
              {editingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    onBlur={handleNameSubmit}
                    autoFocus
                    className="font-bold text-slate-800 bg-white border-2 border-indigo-500 rounded px-2 py-0.5 outline-none"
                  />
                  <button onClick={handleNameSubmit} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                    <Check size={16} />
                  </button>
                  <button onClick={() => { setDocName(activeDoc?.name || ''); setEditingName(false); }} className="p-1 text-red-600 hover:bg-red-50 rounded">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 
                    className="font-bold text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
                    onClick={() => isLockedByMe && setEditingName(true)}
                    title={isLockedByMe ? "Click para editar el nombre" : "Solo lectura"}
                  >
                    {activeDoc?.name}
                  </h2>
                  {isLockedByMe && (
                    <Edit3 size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              )}
              <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">{activeDoc?.version}</span>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
              <ShieldCheck size={10} className="text-emerald-500" /> Control de versiones activado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLockedByMe && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSaving ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {isSaving ? (
                <>
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Edit3 size={14} />
                  Editando
                </>
              )}
            </div>
          )}
          {!isLockedByMe && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-amber-100 text-amber-700`}>
              <Lock size={14} />
              Solo Lectura
            </div>
          )}

          <div className="w-px h-6 bg-slate-200 mx-2" />

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Historial de Versiones"
          >
            <History size={20} />
          </button>

          <button
            onClick={() => setShowPermissionsModal(true)}
            className={`p-2 rounded-lg transition-colors ${showPermissionsModal ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Compartir"
          >
            <Users size={20} />
          </button>

          <button
            onClick={() => setShowVersionModal(true)}
            disabled={!isLockedByMe}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 ml-2"
          >
            <Save size={18} />
            Publicar Versión
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col bg-slate-100 relative">
          <main className="flex-1 overflow-auto">
            <RichTextEditor
              content={currentText}
              onChange={setCurrentText}
              editable={isLockedByMe}
              docName={activeDoc?.name}
            />
          </main>

          {!isLockedByMe && lockMessage && (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center shadow-inner shadow-amber-100">
                  <Lock size={32} strokeWidth={3} />
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-800 text-lg tracking-tight leading-tight">Documento Bloqueado</p>
                  <p className="text-sm text-slate-500 font-medium mt-2 max-w-[250px]">{lockMessage}</p>
                  <p className="text-xs text-slate-400 mt-3">Por favor espera a que termine de editar o intenta más tarde.</p>
                </div>
                <button
                  onClick={onBack}
                  className="mt-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                >
                  Volver al Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {showHistory && (
          <aside className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-tight">
                <History size={16} className="text-indigo-600" />
                Historial
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {activeDoc?.versions?.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-10 italic">No hay versiones guardadas</p>
              ) : (
                activeDoc?.versions?.map((ver) => (
                  <div key={ver.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">{ver.version_number}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{ver.date}</span>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-slate-500 font-medium mb-1 line-clamp-2">{ver.note || "Sin descripción"}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1"><User size={10} /> {ver.author_name}</p>
                    </div>
                    <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onRestoreVersion(ver)}
                        className="flex-1 text-[10px] font-bold py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                      >
                        Restaurar
                      </button>
                      <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 bg-white">
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>

      {showVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Publicar Nueva Versión</h3>
              <p className="text-sm text-slate-500">Describa los cambios realizados en esta versión.</p>
            </div>
            <form onSubmit={onSaveVersion} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Notas de la Versión</label>
                  <textarea
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-800 resize-none h-32"
                    placeholder="Ej. Se agregaron las conclusiones finales..."
                    value={versionNote}
                    onChange={(e) => setVersionNote(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-8">
                <button
                  type="button"
                  onClick={() => setShowVersionModal(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!versionNote.trim()}
                  className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-lg transition-all"
                >
                  Guardar Versión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">¿Guardar cambios?</h3>
              <p className="text-sm text-slate-500">Tienes cambios sin guardar. ¿Qué deseas hacer?</p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => handleExitModalAction('discard')}
                className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Descartar
              </button>
              <button
                onClick={() => handleExitModalAction('save')}
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                Guardar y Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
