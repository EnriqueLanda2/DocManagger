import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff, Lock, User, ArrowRight, CheckCircle2, Cloud, Shield } from 'lucide-react';
import { login } from '../services/api';

const LandingPage = ({ onLogin, onRegister }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login({ username: identifier, password });
      onLogin(response.data.access, response.data.refresh, response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión. Verifica que el backend esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white overflow-hidden animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
        {/* Left Side - Hero Section with Image */}
        <div className="hidden lg:flex flex-col bg-slate-900 p-8 pb-12 lg:p-10 lg:pb-14 relative animate-in slide-in-from-left duration-700">
          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Cloud size={28} className="text-slate-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">DocManager</h1>
                <p className="text-slate-400 text-sm font-medium">Administración Documental Corporativa</p>
              </div>
            </div>

            {/* Hero Image Placeholder - Professional illustration style */}
            <div className="mb-6 flex-1 min-h-0 flex items-center justify-center mt-2 animate-in zoom-in duration-1000 delay-300">
              <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-2 border border-slate-700/50 shadow-2xl relative w-full max-w-lg mx-auto overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-blue-500/10 rounded-2xl"></div>
                <img
                  src={`${import.meta.env.BASE_URL}dashboard-preview.png`}
                  alt="DocManager Dashboard Preview"
                  className="w-full max-h-[35vh] lg:max-h-[40vh] object-contain object-top rounded-xl border border-slate-700 shadow-inner relative z-10 opacity-90 transition-opacity"
                />
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-3 mt-4 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
              {[
                { icon: CheckCircle2, title: 'Edición Colaborativa', desc: 'Trabaja con tu equipo sin conflictos' },
                { icon: Shield, title: 'Máxima Seguridad', desc: 'Encriptación de extremo a extremo' },
                { icon: Cloud, title: 'Acceso Desde Cualquier Lugar', desc: 'Sincronización en la nube' }
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-4 text-white">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center mt-1 border border-slate-700">
                      <IconComponent size={14} className="text-slate-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-base text-slate-100">{item.title}</p>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col justify-center items-center p-4 pb-8 sm:p-8 sm:pb-12 lg:p-12 lg:pb-16 h-full overflow-hidden animate-in fade-in slide-in-from-right duration-700 relative"
          style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 50%, #faf5ff 100%)' }}>
          {/* Background blobs */}
          <div className="absolute top-10 right-10 w-48 h-48 rounded-full opacity-30 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
          <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />

          <div className="w-full max-w-md relative z-10">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-4 sm:mb-6">
              <div className="flex items-center gap-3 justify-center">
                <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center">
                  <Cloud size={24} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">DocManager</h1>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-100/50 p-6 sm:p-10 border border-white animate-in zoom-in duration-700 delay-200">
              {/* Accent top bar */}
              <div className="h-1 w-16 rounded-full mb-5 sm:mb-7" style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }} />

              {/* Header */}
              <div className="mb-5 sm:mb-7">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Bienvenido</h2>
                <p className="text-slate-400 text-sm mt-1.5 font-medium">Ingresa tus credenciales para continuar.</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl flex items-center gap-2 animate-in fade-in duration-300">
                  <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-red-600">!</span>
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username/Email Field */}
                <div>
                  <label htmlFor="landing-identifier" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                    Usuario o Correo
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors duration-200" size={17} />
                    <input
                      id="landing-identifier"
                      type="text"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 focus:border-indigo-400 focus:bg-white rounded-2xl outline-none transition-all duration-200 text-slate-900 placeholder:text-slate-300 font-semibold shadow-sm focus:shadow-indigo-100 focus:shadow-md"
                      placeholder="tu_usuario"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="landing-password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                    Contraseña
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors duration-200" size={17} />
                    <input
                      id="landing-password"
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 focus:border-indigo-400 focus:bg-white rounded-2xl outline-none transition-all duration-200 text-slate-900 placeholder:text-slate-300 font-semibold shadow-sm focus:shadow-indigo-100 focus:shadow-md"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors p-1.5 rounded-xl hover:bg-indigo-50"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white font-black py-3.5 rounded-full transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm tracking-wide hover:scale-[1.02] hover:shadow-xl"
                  style={{ background: isLoading ? '#818cf8' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 8px 24px -4px rgba(99,102,241,0.45)' }}
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      Acceder al Sistema
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-400 font-medium">
                  ¿No tienes una cuenta?{' '}
                  <button
                    onClick={onRegister}
                    className="font-black text-indigo-500 hover:text-purple-600 transition-colors ml-1"
                  >
                    Regístrate gratis →
                  </button>
                </p>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-[10px] text-slate-400 mt-4 mb-1 font-bold uppercase tracking-tight">
              DocManager Pro &copy; 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

LandingPage.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
};

export default LandingPage;
