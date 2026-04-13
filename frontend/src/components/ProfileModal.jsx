import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Mail, Phone, Lock, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { getProfile, updateProfile, changePassword } from '../services/api';
import toast from 'react-hot-toast';

const SkeletonField = () => (
  <div className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
);

const SkeletonForm = () => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1"><div className="h-3 w-16 bg-slate-100 rounded animate-pulse" /><SkeletonField /></div>
      <div className="space-y-1"><div className="h-3 w-16 bg-slate-100 rounded animate-pulse" /><SkeletonField /></div>
    </div>
    <div className="space-y-1"><div className="h-3 w-24 bg-slate-100 rounded animate-pulse" /><SkeletonField /></div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1"><div className="h-3 w-16 bg-slate-100 rounded animate-pulse" /><SkeletonField /></div>
      <div className="space-y-1"><div className="h-3 w-12 bg-slate-100 rounded animate-pulse" /><SkeletonField /></div>
    </div>
    <div className="space-y-1"><div className="h-3 w-14 bg-slate-100 rounded animate-pulse" /><SkeletonField /></div>
    <div className="h-11 bg-slate-100 rounded-2xl animate-pulse mt-2" />
  </div>
);

const InfoTab = ({ isLoading, form, setForm, isSaving, savedInfo, onSubmit }) => {
  if (isLoading) return <SkeletonForm />;
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="profile-first-name" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nombre</label>
          <input
            id="profile-first-name"
            type="text"
            value={form.first_name}
            onChange={e => setForm({ ...form, first_name: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '') })}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-400 transition-colors"
            placeholder="Juan"
          />
        </div>
        <div>
          <label htmlFor="profile-last-name" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Apellido</label>
          <input
            id="profile-last-name"
            type="text"
            value={form.last_name}
            onChange={e => setForm({ ...form, last_name: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '') })}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-400 transition-colors"
            placeholder="Pérez"
          />
        </div>
      </div>

      <div>
        <label htmlFor="profile-email" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Correo electrónico</label>
        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="profile-email"
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-400 transition-colors"
            placeholder="juan@correo.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="profile-phone" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Teléfono</label>
          <div className="relative">
            <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="profile-phone"
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-400 transition-colors"
              placeholder="5512345678"
            />
          </div>
        </div>
        <div>
          <label htmlFor="profile-age" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Edad</label>
          <input
            id="profile-age"
            type="text"
            inputMode="numeric"
            maxLength="3"
            value={form.age}
            onChange={e => setForm({ ...form, age: e.target.value.replace(/\D/g, '') })}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-400 transition-colors"
            placeholder="25"
          />
        </div>
      </div>

      <div>
        <label htmlFor="profile-gender" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Género</label>
        <select
          id="profile-gender"
          value={form.gender}
          onChange={e => setForm({ ...form, gender: e.target.value })}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-400 transition-colors"
        >
          <option value="">Seleccionar...</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="otro">Otro</option>
          <option value="prefiero_no_decir">Prefiero no decir</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className={`w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-60 ${savedInfo ? 'bg-emerald-500 text-white' : 'bg-slate-900 hover:bg-blue-600 text-white'}`}
      >
        {isSaving && (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{' '}
            Guardando...
          </>
        )}
        {!isSaving && savedInfo && <><CheckCircle2 size={16} />{' '}Guardado</>}
        {!isSaving && !savedInfo && <><Save size={16} />{' '}Guardar Cambios</>}
      </button>
    </form>
  );
};

InfoTab.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  savedInfo: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const PasswordTab = ({ passForm, setPassForm, isSaving, showCurrent, setShowCurrent, showNew, setShowNew, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-3">
    <div>
      <label htmlFor="profile-current-password" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Contraseña actual</label>
      <div className="relative">
        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id="profile-current-password"
          type={showCurrent ? 'text' : 'password'}
          value={passForm.current_password}
          onChange={e => setPassForm({ ...passForm, current_password: e.target.value })}
          className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-400 transition-colors"
          placeholder="••••••••"
          required
        />
        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>

    <div>
      <label htmlFor="profile-new-password" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nueva contraseña</label>
      <div className="relative">
        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id="profile-new-password"
          type={showNew ? 'text' : 'password'}
          value={passForm.new_password}
          onChange={e => setPassForm({ ...passForm, new_password: e.target.value })}
          className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-400 transition-colors"
          placeholder="Min. 8 caracteres"
          required
        />
        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>

    <div>
      <label htmlFor="profile-confirm-password" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Confirmar nueva contraseña</label>
      <div className="relative">
        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id="profile-confirm-password"
          type={showNew ? 'text' : 'password'}
          value={passForm.confirm_password}
          onChange={e => setPassForm({ ...passForm, confirm_password: e.target.value })}
          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-blue-400 transition-colors"
          placeholder="Repite la contraseña"
          required
        />
      </div>
    </div>

    <button
      type="submit"
      disabled={isSaving}
      className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-bold text-sm transition-colors disabled:opacity-60"
    >
      {isSaving ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{' '}
          Actualizando...
        </>
      ) : (
        <><Lock size={16} />{' '}Cambiar Contraseña</>
      )}
    </button>
  </form>
);

PasswordTab.propTypes = {
  passForm: PropTypes.object.isRequired,
  setPassForm: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  showCurrent: PropTypes.bool.isRequired,
  setShowCurrent: PropTypes.func.isRequired,
  showNew: PropTypes.bool.isRequired,
  setShowNew: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const ProfileModal = ({ currentUser, onClose, onUserUpdate }) => {
  const [tab, setTab] = useState('info');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedInfo, setSavedInfo] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', age: '', gender: ''
  });
  const [passForm, setPassForm] = useState({
    current_password: '', new_password: '', confirm_password: ''
  });

  useEffect(() => {
    setIsLoading(true);
    getProfile()
      .then(res => setForm({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        age: res.data.age != null ? String(res.data.age) : '',
        gender: res.data.gender || '',
      }))
      .catch(() => toast.error('Error al cargar el perfil'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(form);
      setIsLoading(true);
      const fresh = await getProfile();
      setForm({
        first_name: fresh.data.first_name || '',
        last_name: fresh.data.last_name || '',
        email: fresh.data.email || '',
        phone: fresh.data.phone || '',
        age: fresh.data.age != null ? String(fresh.data.age) : '',
        gender: fresh.data.gender || '',
      });
      setIsLoading(false);
      const updated = { ...currentUser, email: fresh.data.email, first_name: fresh.data.first_name, last_name: fresh.data.last_name };
      localStorage.setItem('user', JSON.stringify(updated));
      onUserUpdate(updated);
      setSavedInfo(true);
      setTimeout(() => setSavedInfo(false), 2500);
      toast.success('Perfil actualizado');
    } catch (err) {
      setIsLoading(false);
      toast.error(err.response?.data?.error || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm_password) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setIsSaving(true);
    try {
      await changePassword({ current_password: passForm.current_password, new_password: passForm.new_password });
      toast.success('Contraseña actualizada');
      setPassForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = currentUser?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4">

        {/* Header */}
        <div className="relative bg-slate-900 px-6 pt-8 pb-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-black text-xl shadow-lg">
              {initials}
            </div>
            <div>
              <p className="text-white font-black text-lg leading-tight">{currentUser?.username}</p>
              {isLoading
                ? <div className="h-3.5 w-32 bg-slate-700 rounded animate-pulse mt-1" />
                : <p className="text-slate-400 text-sm mt-0.5">{form.email}</p>
              }
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            className={`flex-1 py-3.5 text-sm font-bold transition-colors ${tab === 'info' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-700'}`}
            onClick={() => setTab('info')}
          >
            Mi Perfil
          </button>
          <button
            className={`flex-1 py-3.5 text-sm font-bold transition-colors ${tab === 'password' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-700'}`}
            onClick={() => setTab('password')}
          >
            Contraseña
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pt-5 pb-6">
          {tab === 'info' && (
            <InfoTab
              isLoading={isLoading}
              form={form}
              setForm={setForm}
              isSaving={isSaving}
              savedInfo={savedInfo}
              onSubmit={handleSaveInfo}
            />
          )}
          {tab === 'password' && (
            <PasswordTab
              passForm={passForm}
              setPassForm={setPassForm}
              isSaving={isSaving}
              showCurrent={showCurrent}
              setShowCurrent={setShowCurrent}
              showNew={showNew}
              setShowNew={setShowNew}
              onSubmit={handleChangePassword}
            />
          )}
        </div>
      </div>
    </div>
  );
};

ProfileModal.propTypes = {
  currentUser: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onUserUpdate: PropTypes.func.isRequired,
};

export { InfoTab, PasswordTab };
export default ProfileModal;
