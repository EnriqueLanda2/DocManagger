import React, { useState, useMemo, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { getAccessToken, setTokens, clearTokens } from './utils/tokenUtils';
import {
  getDocuments,
  createDocument,
  updateDocument,
  acquireLock,
  releaseLock,
  sendHeartbeat,
  autosaveDocument,
  saveVersion,
  shareDocument,
  revokePermission,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  deleteDocument,
} from './services/api';
import LandingPage from './pages/LandingPage';
import Register from './auth/Register';
import PermissionsModal from './components/PermissionsModal';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import CompareView from './pages/CompareView';
import CreateDocumentModal from './components/CreateDocumentModal';
import SplashScreen from './components/SplashScreen';
import ProfileModal from './components/ProfileModal';
import PublicViewer from './pages/PublicViewer';
import NotFound from './pages/NotFound';

const slugify = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const getAppBase = () => {
  const p = globalThis.location.pathname;
  const idx = p.indexOf('/docM');
  return idx >= 0 ? p.slice(0, idx + 5) : '/docM';
};

const App = () => {
  const [token, setToken] = useState(getAccessToken());
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [view, setView] = useState('dashboard');
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [compareVersions, setCompareVersions] = useState([null, null]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionNote, setVersionNote] = useState('');
  const [invitations, setInvitations] = useState([]);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [openingDocId, setOpeningDocId] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('forward');

  const [documents, setDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [currentText, setCurrentText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const textRef = React.useRef(currentText);
  useEffect(() => { textRef.current = currentText; }, [currentText]);

  const hasUnsavedChanges = currentText !== originalText;

  const [isLockedByMe, setIsLockedByMe] = useState(false);
  const [lockMessage, setLockMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const lastActivityRef = React.useRef(Date.now());
  const isLockedByMeRef = React.useRef(false);
  const selectedDocIdRef = React.useRef(null);
  useEffect(() => { isLockedByMeRef.current = isLockedByMe; }, [isLockedByMe]);
  useEffect(() => { selectedDocIdRef.current = selectedDocId; }, [selectedDocId]);

  const fetchDocuments = useCallback(async () => {
    if (!token) return;
    setIsLoadingDocuments(true);
    try {
      const response = await getDocuments();
      if (Array.isArray(response.data)) setDocuments(response.data);
      else setDocuments([]);
    } catch (error) {
      console.error("Error fetching documents:", error);
      if (error.response?.status !== 401) {
        toast.error("Error al obtener los documentos del servidor");
      }
    } finally {
      setIsLoadingDocuments(false);
    }
  }, [token]);

  const fetchInvitations = useCallback(async () => {
    if (!token) return;
    try {
      const response = await getMyInvitations();
      setInvitations(response.data);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchDocuments();
      fetchInvitations();
    }
  }, [token, fetchDocuments, fetchInvitations]);

  useEffect(() => {
    const match = globalThis.location.pathname.match(/\/docs\/([^/]+)/);
    const docSlug = match ? match[1] : null;
    if (docSlug && documents.length > 0 && token) {
      const doc = documents.find(d => slugify(d.name) === docSlug);
      if (doc) {
        setSelectedDocId(doc.id);
        setCurrentText(doc.content);
        setView('editor');
        acquireLock(doc.id)
          .then(() => { setIsLockedByMe(true); })
          .catch(err => {
            setIsLockedByMe(false);
            setLockMessage(err.response?.data?.message);
          });
      }
    }
  }, [documents, token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (accessToken, refreshToken, userData) => {
    setTransitionDirection('forward');
    setIsTransitioning(true);
    setTimeout(() => {
      setToken(accessToken);
      setCurrentUser(userData);
      setTokens(accessToken, refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsTransitioning(false);
      const redirect = sessionStorage.getItem('postLoginRedirect');
      if (redirect) {
        sessionStorage.removeItem('postLoginRedirect');
        globalThis.history.pushState({}, '', redirect);
      }
    }, 600);
  };

  // Block back-button navigation to protected routes when logged out
  useEffect(() => {
    const handlePopState = () => {
      if (!token) {
        const path = globalThis.location.pathname.replace(getAppBase(), '').replace(/^\//, '');
        const isProtected = path.startsWith('docs/') || path === 'documentos';
        if (isProtected) {
          globalThis.history.replaceState({}, '', `${getAppBase()}/inicio`);
        }
      }
    };
    globalThis.addEventListener('popstate', handlePopState);
    return () => globalThis.removeEventListener('popstate', handlePopState);
  }, [token]);

  const handleLogout = () => {
    setTransitionDirection('backward');
    setIsTransitioning(true);
    const doLogout = async () => {
      if (isLockedByMe && selectedDocId) {
        await handleAutosave();
        try {
          await releaseLock(selectedDocId);
        } catch (e) { console.error("Unlock error", e); }
      }
      setToken(null);
      setCurrentUser(null);
      clearTokens();
      setView('dashboard');
      globalThis.history.replaceState({}, '', `${getAppBase()}/inicio`);
      setIsTransitioning(false);
    };
    setTimeout(() => { void doLogout(); }, 600);
  };

  // Sync URL → initial view on first load
  useEffect(() => {
    const path = globalThis.location.pathname.replace(getAppBase(), '').replace(/^\//, '');
    if (path === 'registro' || path === 'register') setView('register');
    const params = new URLSearchParams(globalThis.location.search);
    if (params.get('view') === 'reset_password') setView('dashboard');
    const KNOWN = ['', 'inicio', 'registro', 'documentos', 'login', 'register', 'dashboard'];
    const isKnown = KNOWN.includes(path) || path.startsWith('docs/') || path.startsWith('view/');
    if (!isKnown) setView('404');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync view/token → URL
  useEffect(() => {
    const path = globalThis.location.pathname;
    if (path.includes('/docs/') || path.includes('/view/')) return;
    const base = getAppBase();
    if (!token) {
      globalThis.history.replaceState({}, '', view === 'register' ? `${base}/registro` : `${base}/inicio`);
    } else if (view === 'dashboard') {
      globalThis.history.replaceState({}, '', `${base}/documentos`);
    }
  }, [view, token]);

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const docView = params.get('view');
    if (docView === 'reset_password') {
      setView('dashboard');
    }
  }, []);

  const handleAutosave = useCallback(async () => {
    const docId = selectedDocId;
    if (!docId || !isLockedByMe) return;
    setIsSaving(true);
    try {
      await autosaveDocument(docId, textRef.current);
    } catch (e) { console.error("Autosave error", e); }
    setTimeout(() => setIsSaving(false), 2000);
  }, [selectedDocId, isLockedByMe]);

  useEffect(() => {
    if (view !== 'editor' || !selectedDocId) return;

    const intervals = [];

    if (isLockedByMe) {
      intervals.push(setInterval(() => {
        sendHeartbeat(selectedDocId).catch(e => console.error("Heartbeat error", e));
      }, 30000));
      intervals.push(setInterval(() => { void handleAutosave(); }, 30000));
    }

    intervals.push(setInterval(() => {
      if (!isLockedByMe) return;
      getDocuments()
        .then(response => {
          const doc = response.data.find(d => d.id === selectedDocId);
          if (doc?.status === 'bloqueado' && doc.locked_by !== currentUser?.id) {
            setIsLockedByMe(false);
            setLockMessage(`El documento está siendo editado por ${doc.locked_by_name}`);
          }
        })
        .catch(e => console.error("Status check error", e));
    }, 10000));

    return () => intervals.forEach(clearInterval);
  }, [view, isLockedByMe, selectedDocId, currentUser?.id, handleAutosave]);

  useEffect(() => {
    if (view !== 'editor') return;
    const updateActivity = () => { lastActivityRef.current = Date.now(); };
    document.addEventListener('mousemove', updateActivity);
    document.addEventListener('keydown', updateActivity);
    document.addEventListener('mousedown', updateActivity);
    document.addEventListener('touchstart', updateActivity);
    return () => {
      document.removeEventListener('mousemove', updateActivity);
      document.removeEventListener('keydown', updateActivity);
      document.removeEventListener('mousedown', updateActivity);
      document.removeEventListener('touchstart', updateActivity);
    };
  }, [view]);

  useEffect(() => {
    if (view !== 'editor') return;
    const INACTIVITY_MS = 1 * 60 * 1000;
    const timer = setInterval(async () => {
      if (!isLockedByMeRef.current || !selectedDocIdRef.current) return;
      if (Date.now() - lastActivityRef.current < INACTIVITY_MS) return;
      const docId = selectedDocIdRef.current;
      setIsSaving(true);
      try { await autosaveDocument(docId, textRef.current); } catch (e) { console.error('Inactivity autosave', e); }
      try { await releaseLock(docId); } catch (e) { console.error('Inactivity release lock', e); }
      setIsSaving(false);
      setIsLockedByMe(false);
      setView('dashboard');
      toast('Sesión cerrada por inactividad. Cambios guardados automáticamente.', { duration: 6000 });
    }, 30000);
    return () => clearInterval(timer);
  }, [view]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLockedByMe && selectedDocId) {
        handleAutosave()
          .then(() => releaseLock(selectedDocId))
          .catch(e => console.error("Unlock error on close", e));
      }
    };

    globalThis.addEventListener('beforeunload', handleBeforeUnload);
    return () => globalThis.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isLockedByMe, selectedDocId, handleAutosave]);

  const activeDoc = useMemo(() => documents.find(d => d.id === selectedDocId), [documents, selectedDocId]);

  const userRole = useMemo(() => {
    if (!activeDoc || !currentUser) return null;
    if (activeDoc.owner === currentUser.id) return 'owner';
    const perm = activeDoc.permissions?.find(p => p.user === currentUser.id && p.status === 'aceptado');
    return perm?.role ?? null;
  }, [activeDoc, currentUser]);

  const handleOpenDoc = async (doc) => {
    lastActivityRef.current = Date.now();
    setOpeningDocId(doc.id);
    setSelectedDocId(doc.id);
    setCurrentText(doc.content);
    setOriginalText(doc.content);

    globalThis.history.pushState({}, '', `${getAppBase()}/docs/${slugify(doc.name)}`);

    try {
      await acquireLock(doc.id);
      setIsLockedByMe(true);
      setLockMessage(null);
    } catch (error) {
      const data = error.response?.data;
      if (error.response?.status === 409) {
        setIsLockedByMe(false);
        setLockMessage(data?.message || `El documento está siendo editado por ${data?.locked_by}`);
      } else {
        toast.error(data?.error || "No se pudo acceder al documento");
      }
    }
    setOpeningDocId(null);
    setView('editor');
  };

  const handleBackToDashboard = async () => {
    if (isLockedByMe) {
      await handleAutosave();
      try {
        await releaseLock(selectedDocId);
      } catch (e) { console.error("Unlock error", e); }
    }
    setIsLockedByMe(false);
    setLockMessage(null);
    setSelectedDocId(null);
    setOriginalText('');

    globalThis.history.pushState({}, '', `${getAppBase()}/documentos`);

    setView('dashboard');
    fetchDocuments();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    try {
      await createDocument({ name: newDocName, content: '' });
      await fetchDocuments();
      setShowCreateModal(false);
      setNewDocName('');
      toast.success("Documento creado exitosamente");
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("Error al crear el documento");
    }
  };

  const handleVersionSubmit = async (e) => {
    e.preventDefault();

    try {
      await saveVersion(activeDoc.id, { content: currentText, note: versionNote });
      await fetchDocuments();
      setShowVersionModal(false);
      setOriginalText(currentText);
      setVersionNote('');
      toast.success("Nueva versión guardada correctamente");
    } catch (error) {
      console.error("Error saving version:", error);
      toast.error("Error al guardar la versión");
    }
  };

  const handleRestoreVersion = (ver) => {
    setCurrentText(ver.content);
    toast.success(`Contenido restaurado a la versión ${ver.version_number}`);
  };

  const handleShare = async (email, role) => {
    try {
      await shareDocument(activeDoc.id, { email, role });
      toast.success(`Invitación enviada a ${email}`);
      fetchDocuments();
    } catch (err) {
      const msg = err.response?.data?.error || "No se pudo compartir";
      toast.error(msg);
    }
  };

  const handleRevoke = async (userId) => {
    try {
      await revokePermission(activeDoc.id, { user_id: userId });
      toast.success("Acceso revocado");
      fetchDocuments();
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleAcceptInvitation = async (permId) => {
    try {
      await acceptInvitation({ permission_id: permId });
      toast.success("Invitación aceptada correctamente");
      fetchInvitations();
      fetchDocuments();
    } catch {
      toast.error("Error al aceptar invitación");
    }
  };

  const handleRejectInvitation = async (permId) => {
    try {
      await rejectInvitation({ permission_id: permId });
      toast.success("Invitación rechazada");
      fetchInvitations();
    } catch {
      toast.error("Error al rechazar invitación");
    }
  };

  const handleDeleteDoc = async (doc) => {
    try {
      await deleteDocument(doc.id);
      toast.success(`"${doc.name}" eliminado`);
      fetchDocuments();
    } catch (err) {
      const msg = err.response?.data?.error || "Error al eliminar el documento";
      toast.error(msg);
    }
  };

  const handleUpdateDocName = async (newName) => {
    if (!activeDoc || !newName.trim()) return;
    try {
      await updateDocument(activeDoc.id, { name: newName.trim() });
      toast.success("Nombre del documento actualizado");
      fetchDocuments();
    } catch {
      toast.error("Error al actualizar el nombre");
    }
  };

  if (view === '404') return <NotFound onGoHome={() => { setView('dashboard'); globalThis.history.pushState({}, '', `${getAppBase()}/inicio`); }} />;

  // Public share link — no auth needed
  const viewMatch = globalThis.location.pathname.match(/\/view\/([^/]+)/);
  const shareToken = viewMatch ? viewMatch[1] : null;
  if (shareToken) {
    return <PublicViewer token={shareToken} />;
  }

  if (!token) {
    if (view === 'register') {
      return <Register onLogin={handleLogin} onBack={() => setView('login')} />;
    }
    return (
      <LandingPage
        onLogin={handleLogin}
        onRegister={() => { setView('register'); }}
      />
    );
  }

  const renderContent = () => {
    if (view === 'editor' && activeDoc) {
      return (
        <Editor
          activeDoc={activeDoc}
          currentText={currentText}
          setCurrentText={setCurrentText}
          isLockedByMe={isLockedByMe}
          lockMessage={lockMessage}
          isSaving={isSaving}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          showPermissionsModal={showPermissionsModal}
          setShowPermissionsModal={setShowPermissionsModal}
          showVersionModal={showVersionModal}
          setShowVersionModal={setShowVersionModal}
          versionNote={versionNote}
          setVersionNote={setVersionNote}
          onBack={handleBackToDashboard}
          onSaveVersion={handleVersionSubmit}
          onRestoreVersion={handleRestoreVersion}
          userRole={userRole}
          onUpdateDocName={handleUpdateDocName}
        />
      );
    }
    if (view === 'compare' && activeDoc) {
      return (
        <CompareView
          activeDoc={activeDoc}
          compareVersions={compareVersions}
          setCompareVersions={setCompareVersions}
          onBack={() => setView('editor')}
        />
      );
    }
    if (!['dashboard', 'editor', 'compare'].includes(view)) {
      return <NotFound onGoHome={() => setView('dashboard')} />;
    }
    return (
      <Dashboard
        documents={documents}
        isLoading={isLoadingDocuments}
        currentUser={currentUser}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        invitations={invitations}
        onOpenDoc={handleOpenDoc}
        onCreateDoc={() => setShowCreateModal(true)}
        onLogout={handleLogout}
        onAcceptInvitation={handleAcceptInvitation}
        onRejectInvitation={handleRejectInvitation}
        onDeleteDoc={handleDeleteDoc}
        onOpenProfile={() => setShowProfileModal(true)}
        openingDocId={openingDocId}
      />
    );
  };

  const getTransitionClasses = () => {
    if (!isTransitioning) return 'opacity-100 translate-x-0 scale-100 blur-0';
    if (transitionDirection === 'forward') {
      return 'opacity-0 translate-x-[-15%] scale-105 blur-sm';
    } else {
      return 'opacity-0 translate-x-[15%] scale-95 blur-sm';
    }
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div
      key={token ? `auth-${view}` : 'unauth'}
      className={`transition-all duration-500 ease-out min-h-screen w-full ${getTransitionClasses()}`}
    >
      {openingDocId && (
        <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-600 font-bold text-sm">Abriendo documento...</p>
        </div>
      )}
      <Toaster position="top-right" reverseOrder={false} />
      {renderContent()}
      {showPermissionsModal && activeDoc && (
        <PermissionsModal
          doc={activeDoc}
          currentUser={currentUser}
          onClose={() => setShowPermissionsModal(false)}
          onShare={handleShare}
          onRevoke={handleRevoke}
        />
      )}
      {showProfileModal && (
        <ProfileModal
          currentUser={currentUser}
          onClose={() => setShowProfileModal(false)}
          onUserUpdate={(updated) => setCurrentUser(updated)}
        />
      )}
      <CreateDocumentModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        name={newDocName}
        setName={setNewDocName}
      />
    </div>
  );
};

export default App;
