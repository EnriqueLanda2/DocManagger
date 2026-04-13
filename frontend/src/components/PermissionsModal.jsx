import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, UserPlus, Shield, Trash2, Mail } from 'lucide-react';

const PermissionsModal = ({ doc, currentUser, onClose, onShare, onRevoke }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('lector');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleShare = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setIsSubmitting(true);
        await onShare(email, role);
        setEmail('');
        setIsSubmitting(false);
    };

    const isOwner = Number(doc.owner) === Number(currentUser?.id);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-#062016/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Gestionar Accesos</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{doc.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm border border-transparent hover:border-slate-200">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isOwner && (
                        <div className="mb-8">
                            <label htmlFor="perm-invite-email" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Invitar Colaborador</label>
                            <form onSubmit={handleShare} className="flex gap-2">
                                <div className="flex-1 relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        id="perm-invite-email"
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <select
                                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm cursor-pointer"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="lector">Lector</option>
                                    <option value="editor">Editor</option>
                                </select>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !email.trim()}
                                    className="bg-lime-600 hover:bg-indigo-700 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <UserPlus size={20} />
                                </button>
                            </form>
                        </div>
                    )}

                    <p className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Usuarios con Acceso</p>
                    <div className="space-y-3">
                        {/* Owner always shown */}
                        <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-lime-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-md shadow-indigo-100">
                                    {doc.owner_name ? doc.owner_name[0].toUpperCase() : 'O'}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800">{doc.owner_name} <span className="text-[10px] bg-indigo-100 text-lime-600 px-1.5 py-0.5 rounded ml-1 uppercase">Propietario</span></p>
                                    <p className="text-xs text-slate-500 font-medium">Dueño del documento</p>
                                </div>
                            </div>
                        </div>

                        {doc.permissions?.map(perm => (
                            <div key={perm.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-black text-xs group-hover:bg-indigo-50 group-hover:text-lime-600 transition-colors">
                                        {perm.user_name ? perm.user_name[0].toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-black text-slate-800">{perm.user_name}</p>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${perm.status === 'aceptado' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {perm.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">{perm.user_email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                                        <Shield size={12} className="text-indigo-500" />
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{perm.role}</span>
                                    </div>
                                    {isOwner && (
                                        <button
                                            onClick={() => onRevoke(perm.user)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-#062016 text-white rounded-xl font-black text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                    >
                        Finalizar
                    </button>
                </div>
            </div>
        </div>
    );
};

PermissionsModal.propTypes = {
  doc: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onRevoke: PropTypes.func.isRequired,
};

export default PermissionsModal;
