import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Login = ({ onLogin, onRegister }) => {
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
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.token, data.user);
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError(err?.message || 'Error de conexión. Verifica que el backend esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-100/40 blur-3xl animate-pulse"></div>
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-emerald-100/40 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-lime-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Bienvenido</h2>
          <p className="text-slate-500 mt-2">Ingresa a DocManager Pro</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg flex items-center">
            <span className="font-bold mr-2">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="login-identifier" className="text-sm font-bold text-slate-700 ml-1">Usuario o Correo</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-lime-600">
                <User size={20} />
              </div>
              <input
                id="login-identifier"
                type="text"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                placeholder="usuario@correo.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="text-sm font-bold text-slate-700 ml-1">Contraseña</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-lime-600">
                <Lock size={20} />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-lime-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-lime-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Iniciar Sesión <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          ¿No tienes una cuenta?{' '}
          <button onClick={onRegister} className="font-bold text-lime-600 hover:text-indigo-800">
            Crear Cuenta
          </button>
        </p>
      </div>
    </div>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
};

export default Login;
