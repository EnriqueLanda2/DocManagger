import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, Link, Eye, Copy, Check, Search, UserPlus, ChevronDown } from 'lucide-react';
import { generateShareLink, shareDocument, searchUsers } from '../services/api';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'lector', label: 'Lector', desc: 'Solo puede ver' },
  { value: 'editor', label: 'Editor', desc: 'Puede editar' },
];

const RoleSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = ROLES.find(r => r.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
      >
        {current?.label} <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 bg-white rounded-xl shadow-xl border border-slate-100 py-1 w-36">
          {ROLES.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => { onChange(r.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors ${value === r.value ? 'font-black text-blue-600' : 'font-medium text-slate-700'}`}
            >
              <p className="font-bold">{r.label}</p>
              <p className="text-[10px] text-slate-400">{r.desc}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

RoleSelect.propTypes = { value: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired };

const ShareModal = ({ doc, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [shareRole, setShareRole] = useState('lector');
  const [sharing, setSharing] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearching(true);
      searchUsers(query.trim())
        .then(res => setResults(res.data))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleShare = async () => {
    if (!selectedUser) return;
    setSharing(true);
    try {
      await shareDocument(doc.id, { email: selectedUser.email, role: shareRole });
      toast.success(`Invitación enviada a ${selectedUser.email}`);
      setSelectedUser(null);
      setQuery('');
      setResults([]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'No se pudo compartir');
    } finally {
      setSharing(false);
    }
  };

  const handleGenerateLink = async (role) => {
    setGeneratingLink(true);
    try {
      const res = await generateShareLink(doc.id, role);
      const base = window.location.origin + window.location.pathname;
      const url = `${base}?share=${res.data.token}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(role);
      toast.success(`Link de ${role === 'viewer' ? 'lectura' : 'editor'} copiado`);
      setTimeout(() => setCopiedLink(null), 2500);
    } catch {
      toast.error('No se pudo generar el link');
    } finally {
      setGeneratingLink(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h4 className="text-base font-black text-slate-800">Compartir documento</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[280px]">{doc.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Section 1: Share with user */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserPlus size={15} className="text-slate-500" />
              <p className="text-sm font-black text-slate-700">Compartir con usuario</p>
            </div>

            {/* Search input */}
            <div className="relative" ref={searchRef}>
              <div className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus-within:border-blue-400 focus-within:bg-white transition-all">
                <Search size={14} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
                  placeholder="Buscar por correo..."
                  value={selectedUser ? selectedUser.email : query}
                  onChange={e => { setSelectedUser(null); setQuery(e.target.value); }}
                  onFocus={() => { if (selectedUser) { setSelectedUser(null); setQuery(''); } }}
                />
                {selectedUser && (
                  <button type="button" onClick={() => { setSelectedUser(null); setQuery(''); }} className="text-slate-400 hover:text-slate-600">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Autocomplete dropdown */}
              {!selectedUser && query.trim() && (
                <div className="absolute left-0 right-0 top-12 z-50 bg-white rounded-xl shadow-xl border border-slate-100 py-1 max-h-44 overflow-y-auto">
                  {searching && (
                    <div className="px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />{' '}
                      Buscando...
                    </div>
                  )}
                  {!searching && results.length === 0 && (
                    <p className="px-4 py-3 text-xs text-slate-400 italic">No se encontró ningún usuario</p>
                  )}
                  {results.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => { setSelectedUser(user); setQuery(''); setResults([]); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                        {user.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{user.username}</p>
                        <p className="text-[10px] text-slate-400">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected user + role + button */}
            {selectedUser && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-2 flex-1 min-w-0 bg-blue-50 rounded-xl px-3 py-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-200 text-blue-700 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                    {selectedUser.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{selectedUser.username}</p>
                    <p className="text-[10px] text-slate-500 truncate">{selectedUser.email}</p>
                  </div>
                </div>
                <RoleSelect value={shareRole} onChange={setShareRole} />
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={sharing}
                  className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-60 whitespace-nowrap flex items-center gap-1.5"
                >
                  {sharing ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus size={12} />}
                  Invitar
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Section 2: Generate link */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link size={15} className="text-slate-500" />
              <p className="text-sm font-black text-slate-700">Generar link de acceso</p>
            </div>
            <div className="flex gap-2">
              {[{ role: 'viewer', label: 'Link de lectura', icon: Eye }, { role: 'editor', label: 'Link de editor', icon: Link }].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleGenerateLink(item.role)}
                  disabled={generatingLink}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all disabled:opacity-60 ${
                    copiedLink === item.role
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {copiedLink === item.role ? <Check size={13} /> : <item.icon size={13} />}
                  {copiedLink === item.role ? 'Copiado' : item.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
              <Copy size={9} /> El link se copia al portapapeles automáticamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

ShareModal.propTypes = {
  doc: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ShareModal;
