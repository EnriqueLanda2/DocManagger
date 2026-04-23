import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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

const EditingBadge = ({ isSaving, mobile }) => {
  const base = mobile
    ? 'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold'
    : 'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all';
  if (isSaving) {
    const spinner = mobile
      ? <div className="w-2.5 h-2.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      : <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    return <div className={`${base} bg-blue-100 text-blue-700`}>{spinner}{!mobile && 'Guardando...'}</div>;
  }
  return (
    <div className={`${base} bg-emerald-100 text-emerald-700`}>
      <Edit3 size={mobile ? 11 : 14} />{!mobile && 'Editando'}
    </div>
  );
};

EditingBadge.propTypes = {
  isSaving: PropTypes.bool,
  mobile: PropTypes.bool,
};

const ReadOnlyBadge = ({ mobile }) => {
  const base = mobile
    ? 'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold'
    : 'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold';
  return (
    <div className={`${base} bg-amber-100 text-amber-700`}>
      <Lock size={mobile ? 11 : 14} />{!mobile && 'Solo Lectura'}
    </div>
  );
};

ReadOnlyBadge.propTypes = { mobile: PropTypes.bool };

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
  userRole,
  onUpdateDocName,
  hasUnsavedChanges
}) => {
  const [editingName, setEditingName] = useState(false);
  const [docName, setDocName] = useState(activeDoc?.name || '');
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitAfterSave, setExitAfterSave] = useState(false);

  useEffect(() => {
    if (activeDoc) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    if (e.key === 'Enter') { handleNameSubmit(); return; }
    if (e.key === 'Escape') { setDocName(activeDoc?.name || ''); setEditingName(false); }
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges && isLockedByMe) { setShowExitModal(true); return; }
    onBack();
  };

  const handleExitModalAction = async (action) => {
    setShowExitModal(false);
    if (action === 'save') { setExitAfterSave(true); setShowVersionModal(true); return; }
    if (action === 'discard') { onBack(); }
  };

  const handleSaveVersion = async (e) => {
    await onSaveVersion(e);
    if (exitAfterSave) {
      setExitAfterSave(false);
      onBack();
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-white overflow-hidden">

      {/* ── Header ── */}
      <header className="min-h-14 sm:h-16 border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between bg-white shrink-0 shadow-sm z-10 gap-2">

        {/* Left: back button + doc info */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={handleBackClick}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 shrink-0 touch-manipulation"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {editingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    onBlur={handleNameSubmit}
                    autoFocus
                    className="font-bold text-slate-800 bg-white border-2 border-indigo-500 rounded px-2 py-0.5 outline-none text-sm w-32 sm:w-48"
                  />
                  <button onClick={handleNameSubmit} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded touch-manipulation">
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => { setDocName(activeDoc?.name || ''); setEditingName(false); }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded touch-manipulation"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2 group min-w-0">
                  <button
                    type="button"
                    className="font-bold text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors bg-transparent border-none p-0 text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px] md:max-w-xs touch-manipulation"
                    onClick={() => isLockedByMe && setEditingName(true)}
                    disabled={!isLockedByMe}
                    title={activeDoc?.name}
                  >
                    {activeDoc?.name}
                  </button>
                  {isLockedByMe && (
                    <Edit3 size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:block" />
                  )}
                </div>
              )}
              <span className="bg-slate-100 text-slate-500 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                {activeDoc?.version}
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 flex items-center gap-1 font-medium">
              <ShieldCheck size={9} className="text-emerald-500" />
              <span className="hidden sm:inline">Control de versiones activado</span>
              <span className="sm:hidden">Versiones activas</span>
            </p>
          </div>
        </div>

        {/* Right: desktop actions */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {isLockedByMe
            ? <EditingBadge isSaving={isSaving} />
            : <ReadOnlyBadge />
          }

          <div className="w-px h-6 bg-slate-200 mx-1" />

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Historial"
          >
            <History size={18} />
          </button>
          <button
            onClick={() => setShowPermissionsModal(true)}
            className={`hidden sm:flex p-2 rounded-lg transition-colors ${showPermissionsModal ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Compartir"
          >
            <Users size={18} />
          </button>
          <button
            onClick={() => setShowVersionModal(true)}
            disabled={!isLockedByMe}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95 ml-1"
          >
            <Save size={16} />
            Publicar Versión
          </button>
        </div>

        {/* Right: mobile compact status */}
        <div className="flex sm:hidden items-center gap-1 shrink-0">
          {isLockedByMe
            ? <EditingBadge isSaving={isSaving} mobile />
            : <ReadOnlyBadge mobile />
          }
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 flex flex-col bg-slate-100 relative">

          {/* Editor area — padding-bottom on mobile for the bottom bar */}
          <main className="flex-1 overflow-auto pb-16 sm:pb-0">
            <RichTextEditor
              content={currentText}
              onChange={setCurrentText}
              editable={isLockedByMe}
              docName={activeDoc?.name}
            />
          </main>

          {/* Locked overlay */}
          {!isLockedByMe && lockMessage && (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center z-20 p-4">
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300 max-w-sm w-full text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-50 text-amber-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-inner shadow-amber-100">
                  <Lock size={28} strokeWidth={3} />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-base sm:text-lg tracking-tight leading-tight">Documento Bloqueado</p>
                  <p className="text-sm text-slate-500 font-medium mt-2">{lockMessage}</p>
                  <p className="text-xs text-slate-400 mt-3">Por favor espera a que termine de editar o intenta más tarde.</p>
                </div>
                <button
                  onClick={onBack}
                  className="mt-1 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all touch-manipulation"
                >
                  Volver al Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── History Panel ── */}
        {showHistory && (
          <aside className="
            fixed inset-0 z-40 flex flex-col bg-white
            sm:relative sm:inset-auto sm:z-auto sm:w-80 sm:border-l sm:border-slate-200 sm:shrink-0
            animate-in slide-in-from-right duration-300
          ">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-tight">
                <History size={16} className="text-indigo-600" />
                Historial
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50/50">
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
                        disabled={userRole === 'lector'}
                        className="flex-1 text-[10px] font-bold py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed touch-manipulation"
                      >
                        Restaurar
                      </button>
                      <button className="p-2.5 border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 bg-white touch-manipulation">
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

      {/* ── Mobile bottom action bar ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around px-2 py-1 z-30 safe-b">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-5 rounded-xl transition-colors touch-manipulation ${showHistory ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}
        >
          <History size={20} />
          <span className="text-[10px] font-bold">Historial</span>
        </button>

        <button
          onClick={() => setShowPermissionsModal(true)}
          className="flex flex-col items-center gap-0.5 py-1.5 px-5 rounded-xl transition-colors text-slate-500 touch-manipulation"
        >
          <Users size={20} />
          <span className="text-[10px] font-bold">Compartir</span>
        </button>

        <button
          onClick={() => setShowVersionModal(true)}
          disabled={!isLockedByMe}
          className="flex flex-col items-center gap-0.5 py-2 px-6 rounded-xl font-bold transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-200 disabled:bg-slate-300 disabled:shadow-none active:scale-95 touch-manipulation"
        >
          <Save size={20} />
          <span className="text-[10px] font-bold">Publicar</span>
        </button>
      </div>

      {/* ── Version modal ── */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden animate-in slide-in-from-bottom sm:fade-in sm:zoom-in duration-200">
            <div className="p-5 sm:p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Publicar Nueva Versión</h3>
              <p className="text-sm text-slate-500">Describa los cambios realizados en esta versión.</p>
            </div>
            <form onSubmit={handleSaveVersion} className="p-5 sm:p-6">
              <div>
                <label htmlFor="editor-version-note" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Notas de la Versión
                </label>
                <textarea
                  id="editor-version-note"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-800 resize-none h-28 sm:h-32"
                  placeholder="Ej. Se agregaron las conclusiones finales..."
                  value={versionNote}
                  onChange={(e) => setVersionNote(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowVersionModal(false)}
                  className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!versionNote.trim()}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-lg transition-all touch-manipulation"
                >
                  Guardar Versión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Exit confirmation modal ── */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">¿Guardar cambios?</h3>
              <p className="text-sm text-slate-500">Tienes cambios sin guardar. ¿Qué deseas hacer?</p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => handleExitModalAction('discard')}
                className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors touch-manipulation"
              >
                Descartar
              </button>
              <button
                onClick={() => handleExitModalAction('save')}
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors touch-manipulation"
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

Editor.propTypes = {
  activeDoc: PropTypes.object.isRequired,
  currentText: PropTypes.string,
  setCurrentText: PropTypes.func.isRequired,
  isLockedByMe: PropTypes.bool,
  lockMessage: PropTypes.string,
  isSaving: PropTypes.bool,
  showHistory: PropTypes.bool,
  setShowHistory: PropTypes.func.isRequired,
  showPermissionsModal: PropTypes.bool,
  setShowPermissionsModal: PropTypes.func.isRequired,
  showVersionModal: PropTypes.bool,
  setShowVersionModal: PropTypes.func.isRequired,
  versionNote: PropTypes.string,
  setVersionNote: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onSaveVersion: PropTypes.func.isRequired,
  onRestoreVersion: PropTypes.func.isRequired,
  userRole: PropTypes.string,
  onUpdateDocName: PropTypes.func.isRequired,
  hasUnsavedChanges: PropTypes.bool,
};

export { EditingBadge, ReadOnlyBadge };
export default Editor;
