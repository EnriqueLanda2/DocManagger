import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {
  FileText,
  Lock,
  Users,
  Plus,
  LogOut,
  CheckCircle2,
  Cloud,
  Trash2,
  X,
  Check,
  FolderOpen,
  MoreVertical,
  Download,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ShareModal from '../components/ShareModal';
import DataTable from 'react-data-table-component';
import Loader from '../components/Loader';

const SpinnerTabla = () => (
  <div className="p-5 text-center">
    <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto" />
    <p className="mt-2 text-slate-400 text-sm">Cargando documentos...</p>
  </div>
);

const DocumentCell = ({ row, currentUser }) => {
  const ext = row.name && row.name.indexOf('.') > 0 ? row.name.split('.').pop().slice(0, 3) : null;
  let abbr = 'DOC';
  if (ext) abbr = ext.toUpperCase();
  else if (row.name) abbr = row.name.slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="flex items-center justify-center rounded-xl font-bold text-blue-600 text-[11px] flex-shrink-0"
        style={{ width: 40, height: 40, background: '#eef2ff' }}>
        {abbr}
      </div>
      <div>
        <div className="font-bold text-slate-800 text-sm flex items-center gap-1">
          {row.name}
          {Number(row.owner) !== Number(currentUser?.id) && (
            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-500 ml-1">Compartido</span>
          )}
        </div>
        <div className="text-slate-400 text-[11px]">Dueño: {row.owner_name}</div>
      </div>
    </div>
  );
};

DocumentCell.propTypes = {
  row: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
};

const StatusCell = ({ row }) => {
  if (row.status === 'bloqueado') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
        <Lock size={11} /> En edición por {row.locked_by_name}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
      <CheckCircle2 size={11} /> Disponible
    </span>
  );
};

StatusCell.propTypes = {
  row: PropTypes.object.isRequired,
};

const VersionCell = ({ row }) => (
  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
    {row.version}
  </span>
);

VersionCell.propTypes = { row: PropTypes.object.isRequired };

const DateCell = ({ row }) => (
  <span className="text-slate-400 text-xs">{row.last_mod}</span>
);

DateCell.propTypes = { row: PropTypes.object.isRequired };

const ActionsCell = ({ row, onOpenDoc, isLoading, openingDocId, currentUser, onOpenMenu }) => (
  <div className="flex items-center gap-2">
    <button
      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full font-bold text-xs transition-all duration-200 border border-blue-100 disabled:opacity-60 min-w-[70px] justify-center"
      onClick={() => onOpenDoc(row)}
      disabled={isLoading || openingDocId === row.id}
    >
      {openingDocId === row.id ? (
        <span className="w-3.5 h-3.5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
      ) : (
        <><FolderOpen size={13} />{' '}Abrir</>
      )}
    </button>
    {Number(row.owner) === Number(currentUser?.id) && (
      <button
        className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
        onClick={(e) => onOpenMenu(e, row)}
        title="Más opciones"
      >
        <MoreVertical size={15} />
      </button>
    )}
  </div>
);

ActionsCell.propTypes = {
  row: PropTypes.object.isRequired,
  onOpenDoc: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  openingDocId: PropTypes.number,
  currentUser: PropTypes.object,
  onOpenMenu: PropTypes.func.isRequired,
};

const StatsModal = ({ type, documents, currentUser, onClose }) => {
  const configs = {
    all: {
      title: 'Todos los Documentos',
      icon: <FileText size={20} className="text-blue-600" />,
      bg: 'bg-blue-50',
      docs: documents,
      empty: 'No tienes documentos aún.',
    },
    editing: {
      title: 'Documentos en Edición',
      icon: <Lock size={20} className="text-amber-600" />,
      bg: 'bg-amber-50',
      docs: documents.filter(d => d.status === 'bloqueado'),
      empty: 'Ningún documento está siendo editado ahora.',
    },
    shared: {
      title: 'Documentos Compartidos',
      icon: <Users size={20} className="text-emerald-600" />,
      bg: 'bg-emerald-50',
      docs: documents.filter(d => Number(d.owner) !== Number(currentUser?.id)),
      empty: 'No tienes documentos compartidos contigo.',
    },
  };
  const cfg = configs[type];
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${cfg.bg}`}>{cfg.icon}</div>
            <h4 className="text-base font-black text-slate-800">{cfg.title}</h4>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">{cfg.docs.length}</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
          {cfg.docs.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-10 italic">{cfg.empty}</p>
          ) : cfg.docs.map(doc => {
            const ext = doc.name?.includes('.') ? doc.name.split('.').pop().slice(0, 3).toUpperCase() : doc.name?.slice(0, 2).toUpperCase();
            return (
              <div key={doc.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                    {ext}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-tight">{doc.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {type === 'editing' ? `Editado por: ${doc.locked_by_name}` : `Dueño: ${doc.owner_name}`}
                      {' · '}{doc.last_mod}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    doc.status === 'bloqueado' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {doc.status === 'bloqueado' ? <Lock size={9} /> : <CheckCircle2 size={9} />}
                    {doc.status === 'bloqueado' ? 'Editando' : 'Libre'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

StatsModal.propTypes = {
  type: PropTypes.string.isRequired,
  documents: PropTypes.array.isRequired,
  currentUser: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

const buildColumns = (currentUser, onOpenDoc, isLoading, openingDocId, onOpenMenu) => [
  {
    name: 'Documento',
    selector: row => row.name,
    sortable: true,
    cell: row => <DocumentCell row={row} currentUser={currentUser} />,
  },
  {
    name: 'Estado',
    selector: row => row.status,
    sortable: true,
    cell: row => <StatusCell row={row} />,
  },
  {
    name: 'Versión',
    selector: row => row.version,
    sortable: true,
    cell: row => <VersionCell row={row} />,
  },
  {
    name: 'Modificado',
    selector: row => row.last_mod,
    sortable: true,
    cell: row => <DateCell row={row} />,
  },
  {
    name: 'Acciones',
    cell: row => <ActionsCell row={row} onOpenDoc={onOpenDoc} isLoading={isLoading} openingDocId={openingDocId} currentUser={currentUser} onOpenMenu={onOpenMenu} />,
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    width: '160px',
  },
];

const Dashboard = ({
  documents,
  isLoading,
  currentUser,
  searchTerm,
  setSearchTerm,
  invitations,
  onOpenDoc,
  onCreateDoc,
  onLogout,
  onAcceptInvitation,
  onRejectInvitation,
  onDeleteDoc,
  onOpenProfile,
  openingDocId
}) => {
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState(null);
  const [statsModal, setStatsModal] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [shareDoc, setShareDoc] = useState(null);
  const menuPortalRef = useRef(null);

  const handleOpenMenu = useCallback((e, row) => {
    e.stopPropagation();
    if (openMenu?.id === row.id) { setOpenMenu(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 160;
    const openUpward = rect.bottom + menuHeight + 4 > window.innerHeight;
    setOpenMenu({ id: row.id, row, x: rect.right, y: openUpward ? rect.top - menuHeight : rect.bottom });
  }, [openMenu]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuPortalRef.current && !menuPortalRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = async (doc) => {
    const toastId = toast.loading('Generando PDF...');
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      const { default: DOMPurify } = await import('dompurify');
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;background:#fff;padding:48px;font-family:Georgia,serif;font-size:14px;line-height:1.8;color:#1a1a1a;';
      const safe = DOMPurify.sanitize(doc.content || '');
      const frag = document.createRange().createContextualFragment(safe);
      wrapper.appendChild(frag);
      document.body.appendChild(wrapper);
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll('link[rel="stylesheet"],style').forEach(el => el.remove());
        },
      });
      document.body.removeChild(wrapper);
      const pdf = new jsPDF({ unit: 'px', format: 'a4', orientation: 'portrait' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const ratio = pdfW / canvas.width;
      const imgH = canvas.height * ratio;
      let y = 0;
      while (y < imgH) {
        if (y > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, -y, pdfW, imgH);
        y += pdfH;
      }
      pdf.save(`${doc.name}.pdf`);
      toast.success('PDF descargado', { id: toastId });
    } catch (err) {
      console.error('PDF error:', err);
      toast.error('Error al generar el PDF', { id: toastId });
    }
  };

  if (isLoading && documents.length === 0) {
    return <Loader fullPage message="Cargando tu espacio de trabajo..." />;
  }

  const documentosFiltrados = documents.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnas = buildColumns(currentUser, onOpenDoc, isLoading, openingDocId, handleOpenMenu);

  const barraDeBusqueda = (
    <div className="relative" style={{ maxWidth: 300, width: '100%' }}>
      <input
        type="text"
        className="w-full px-4 py-2.5 pr-9 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm focus:border-indigo-300 focus:bg-white transition-all"
        placeholder="Buscar documentos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors rounded-full"
          onClick={() => setSearchTerm('')}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8 px-4" style={{ maxWidth: 1200 }}>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
              <Cloud size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                DocManager <span className="text-primary italic">Pro</span>
              </h1>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                Workspace de Colaboración Inteligente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-[1.25rem] border border-slate-200 shadow-sm">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-lg shadow-primary/20">
                {currentUser?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-black text-slate-800 leading-none">{currentUser?.username || 'Usuario'}</p>
                <p className="text-[9px] text-primary font-bold uppercase mt-1">Ver perfil</p>
              </div>
            </button>
            <div className="w-px h-6 bg-slate-100 mx-2" />
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-slate-900">
          <button onClick={() => setStatsModal('all')} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-slate-800">Documentos</p>
                <p className="text-2xl font-black">{documents.length}</p>
              </div>
            </div>
          </button>
          <button onClick={() => setStatsModal('editing')} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-left cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                <Lock size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-slate-800">En Edición</p>
                <p className="text-2xl font-black">{documents.filter(d => d.status === 'bloqueado').length}</p>
              </div>
            </div>
          </button>
          <button onClick={() => setStatsModal('shared')} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-slate-800">Compartidos</p>
                <p className="text-2xl font-black">
                  {documents.filter(d => Number(d.owner) !== Number(currentUser?.id)).length}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Invitaciones */}
        {invitations.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-8 text-slate-900">
            <div className="flex items-center gap-3 mb-3">
              <Users className="text-amber-600" size={20} />
              <div>
                <p className="text-sm font-bold text-amber-800">Invitaciones Pendientes ({invitations.length})</p>
                <p className="text-xs text-amber-700">Tienes solicitudes de acceso esperando tu respuesta.</p>
              </div>
            </div>
            <div className="space-y-2">
              {invitations.map(inv => (
                <div key={inv.permission_id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-amber-100 shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{inv.document_name}</p>
                    <p className="text-xs text-slate-500">
                      De <span className="font-semibold">{inv.owner}</span> · rol: <span className="uppercase font-semibold">{inv.role}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                      onClick={() => onAcceptInvitation(inv.permission_id)}
                    >
                      <Check size={13} /> Aceptar
                    </button>
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
                      onClick={() => onRejectInvitation(inv.permission_id)}
                    >
                      <X size={13} /> Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-50 bg-slate-50/30 rounded-t-[2.5rem]">
            <h3 className="text-xl font-black text-slate-800">Mis Documentos</h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {barraDeBusqueda}
              <button
                className="bg-slate-900 text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-primary transition-all shadow-lg shadow-slate-200 active:scale-95 whitespace-nowrap"
                onClick={onCreateDoc}
              >
                <Plus size={18} /> Nuevo <span className="hidden sm:inline">Documento</span>
              </button>
            </div>
          </div>

          <div className="p-2 sm:p-4" style={{ minHeight: 360 }}>
            <DataTable
              columns={columnas}
              data={documentosFiltrados}
              pagination
              paginationPerPage={5}
              paginationRowsPerPageOptions={[5, 10, 20]}
              paginationComponentOptions={{ rowsPerPageText: 'Filas por página:', rangeSeparatorText: 'de', noRowsPerPage: false, selectAllRowsItem: false }}
              highlightOnHover
              responsive
              noDataComponent={
                <div className="p-10 text-center text-slate-400 font-medium italic">
                  No se encontraron documentos
                </div>
              }
              progressPending={isLoading}
              progressComponent={<SpinnerTabla />}
              onRowClicked={onOpenDoc}
              pointerOnHover
              customStyles={{
                table: { style: { backgroundColor: 'transparent', minHeight: 300 } },
                rows: { style: { borderRadius: '12px', margin: '4px 0', border: 'none', minHeight: 52 } },
                headRow: { style: { backgroundColor: 'transparent', border: 'none', minHeight: '40px' } },
                headCells: { style: { fontVariant: 'small-caps', fontWeight: 'bold', color: '#94a3b8' } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Detail Modal */}
      {statsModal && (
        <StatsModal
          type={statsModal}
          documents={documents}
          currentUser={currentUser}
          onClose={() => setStatsModal(null)}
        />
      )}

      {/* 3-dot Menu Portal */}
      {openMenu && ReactDOM.createPortal(
        <div
          ref={menuPortalRef}
          style={{ position: 'fixed', top: openMenu.y + 4, left: openMenu.x - 208, zIndex: 9999 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 w-52"
        >
          <button
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={(e) => { e.stopPropagation(); setOpenMenu(null); setShareDoc(openMenu.row); }}
          >
            <Share2 size={14} className="text-slate-400" />
            <div className="text-left">
              <p className="font-bold text-xs">Compartir documento</p>
              <p className="text-[10px] text-slate-400">Links e invitaciones</p>
            </div>
          </button>
          <button
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={(e) => { e.stopPropagation(); setOpenMenu(null); handleDownload(openMenu.row); }}
          >
            <Download size={14} className="text-slate-400" />
            <div className="text-left">
              <p className="font-bold text-xs">Descargar PDF</p>
              <p className="text-[10px] text-slate-400">Exportar como PDF</p>
            </div>
          </button>
          <div className="border-t border-slate-100 my-1" />
          <button
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition-colors"
            onClick={(e) => { e.stopPropagation(); setOpenMenu(null); setConfirmDeleteDoc(openMenu.row); }}
          >
            <Trash2 size={14} />
            <p className="font-bold text-xs">Eliminar documento</p>
          </button>
        </div>,
        document.body
      )}

      {/* Share Modal */}
      {shareDoc && <ShareModal doc={shareDoc} onClose={() => setShareDoc(null)} />}

      {/* Confirm Delete Modal */}
      {confirmDeleteDoc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in zoom-in-95 duration-200">
            <h4 className="text-lg font-black text-slate-800 mb-2">Eliminar documento</h4>
            <p className="text-sm text-slate-500 mb-6">
              ¿Estás seguro de que quieres eliminar <span className="font-bold text-slate-700">"{confirmDeleteDoc.name}"</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                onClick={() => setConfirmDeleteDoc(null)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                onClick={() => { onDeleteDoc(confirmDeleteDoc); setConfirmDeleteDoc(null); }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Dashboard.propTypes = {
  documents: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  currentUser: PropTypes.object,
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  invitations: PropTypes.array.isRequired,
  onOpenDoc: PropTypes.func.isRequired,
  onCreateDoc: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onAcceptInvitation: PropTypes.func.isRequired,
  onRejectInvitation: PropTypes.func.isRequired,
  onDeleteDoc: PropTypes.func.isRequired,
  onOpenProfile: PropTypes.func.isRequired,
  openingDocId: PropTypes.number,
};

// eslint-disable-next-line react-refresh/only-export-components
export { DocumentCell, StatusCell, VersionCell, DateCell, ActionsCell, StatsModal, buildColumns, SpinnerTabla };
export default Dashboard;
