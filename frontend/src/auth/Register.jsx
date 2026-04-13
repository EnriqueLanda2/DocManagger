import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff, Lock, User, Mail, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { register } from '../services/api';
import EmailVerification from './EmailVerification';

const Register = ({ onLogin, onBack }) => {
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    age: '',
    gender: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Solo letras y espacios en nombres
    if (name === 'firstName' || name === 'lastName') {
      value = value.replaceAll(/[^a-zA-ZÀ-ÿ\s]/g, '');
    }
    // Solo números en teléfono y edad
    if (name === 'phone' || name === 'age') {
      value = value.replaceAll(/\D/g, '');
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar correo
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Ingresa un correo electrónico válido');
      return;
    }

    // Validar edad (Mínimo 12 años)
    if (formData.age && Number.parseInt(formData.age, 10) < 12) {
      setError('Debes tener al menos 12 años para registrarte');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validador de contraseña fuerte (8 caracteres, letras y números)
    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&.\-_]{8,}$/;
    if (!passRegex.test(formData.password)) {
      setError('La contraseña debe tener al menos 8 caracteres, e incluir letras y números');
      return;
    }

    setIsLoading(true);

    try {
      const response = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        age: formData.age || null,
        gender: formData.gender || null
      });

      const data = response.data;
      if (data.requires_verification) {
        setRegisteredEmail(data.email);
        setRequiresVerification(true);
      } else {
        onLogin(data.access, data.refresh, data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    // Después de verificar, mostrar mensaje de éxito
    setError('');
    onBack(); // Volver a login para que inicie sesión
  };

  // Mostrar pantalla de verificación si es necesario
  if (requiresVerification) {
    return (
      <EmailVerification
        email={registeredEmail}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={() => {
          setRequiresVerification(false);
          setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            phone: '',
            age: '',
            gender: ''
          });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative py-4 sm:py-8 px-4 overflow-y-auto">
      <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-100/40 blur-3xl animate-pulse"></div>
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 border border-slate-100 my-4">
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Crear Cuenta</h2>
          <p className="text-slate-500 text-sm mt-1">Regístrate en DocManager Pro</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-1">
              <label htmlFor="reg-firstName" className="text-xs font-bold text-slate-600 ml-1">Nombre(s)</label>
              <input
                id="reg-firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="Juan"
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="reg-lastName" className="text-xs font-bold text-slate-600 ml-1">Apellido(s)</label>
              <input
                id="reg-lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="Pérez"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-username" className="text-xs font-bold text-slate-600 ml-1">Nombre de usuario</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="reg-username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="juanperez123"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-email" className="text-xs font-bold text-slate-600 ml-1">Correo electrónico</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="reg-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="juan@correo.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-1">
              <label htmlFor="reg-phone" className="text-xs font-bold text-slate-600 ml-1">Teléfono</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="5512345678"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="reg-age" className="text-xs font-bold text-slate-600 ml-1">Edad</label>
              <input
                id="reg-age"
                type="text"
                inputMode="numeric"
                name="age"
                value={formData.age}
                onChange={handleChange}
                maxLength="3"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="18"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-gender" className="text-xs font-bold text-slate-600 ml-1">Género</label>
            <select
              id="reg-gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            >
              <option value="">Seleccionar...</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
              <option value="prefiero_no_decir">Prefiero no decir</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-1">
              <label htmlFor="reg-password" className="text-xs font-bold text-slate-600 ml-1">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="reg-confirmPassword" className="text-xs font-bold text-slate-600 ml-1">Confirmar</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="reg-confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Crear Cuenta <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="mt-4 pb-2 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <button onClick={onBack} className="font-bold text-indigo-600 hover:text-indigo-800">
            Iniciar Sesión
          </button>
        </p>
      </div>
    </div>
  );
};

Register.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default Register;
