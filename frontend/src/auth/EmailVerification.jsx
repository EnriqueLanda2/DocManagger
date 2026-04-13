import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Mail, ArrowRight, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { verifyEmail, resendVerificationCode } from '../services/api';

const EmailVerificationModal = ({ email, onVerificationSuccess, onBack }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  // Countdown para reenviar código
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (value, index) => {
    // Solo permitir números
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Permitir backspace para borrar
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('Por favor ingresa los 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await verifyEmail({ email, code: fullCode });
      setSuccess(true);
      setTimeout(() => {
        onVerificationSuccess();
      }, 1500);
    } catch (err) {
      const data = err.response?.data;
      if (data?.expired) {
        setError('El código ha expirado. Solicita uno nuevo.');
      } else {
        setError(data?.error || 'Código incorrecto');
      }
      setCode(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      await resendVerificationCode({ email });
      setCountdown(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo reenviar el código');
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-#062016 via-slate-800 to-#062016 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-#062016 mb-2">¡Verificación Completa!</h2>
            <p className="text-slate-600 mb-6">Tu email ha sido verificado correctamente. Redirigiendo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-#062016 via-slate-800 to-#062016 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-lime-600/20 blur-3xl animate-pulse"></div>
        <div className="absolute top-[30%] -right-[15%] w-[70%] h-[70%] rounded-full bg-emerald-600/20 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-10 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-lime-600 to-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail size={32} />
            </div>
            <h2 className="text-3xl font-bold text-#062016 tracking-tight">Verifica tu Email</h2>
            <p className="text-slate-600 mt-2">Hemos enviado un código a</p>
            <p className="text-lime-600 font-semibold mt-1">{email}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg flex items-start gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code Input */}
            <div>
              <label htmlFor="verification-code-0" className="text-sm font-bold text-slate-700 ml-1 block mb-4">
                Ingresa el código de 6 dígitos
              </label>
              <div className="flex gap-2 justify-center mb-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    id={index === 0 ? 'verification-code-0' : undefined}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={code[index]}
                    onChange={(e) => handleCodeChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    disabled={isLoading}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 text-center mt-2">
                ⏱️ Válido por 30 minutos
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || code.join('').length !== 6}
              className="w-full bg-gradient-to-r from-lime-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Verificar <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-500">¿No recibiste el código?</span>
            </div>
          </div>

          {/* Resend Button */}
          <button
            onClick={handleResendCode}
            disabled={isResending || countdown > 0}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-lime-600 hover:text-indigo-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors py-2"
          >
            <RotateCcw size={16} />
            {countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar código'}
          </button>

          {/* Back Button */}
          <button
            onClick={onBack}
            disabled={isLoading}
            className="w-full text-center text-sm text-slate-600 hover:text-slate-800 mt-4 py-2 disabled:opacity-50"
          >
            ← Volver al registro
          </button>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-xs text-blue-800">
              <strong>💡 Consejo:</strong> Revisa tu carpeta de spam si no ves el correo en tu bandeja de entrada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

EmailVerificationModal.propTypes = {
  email: PropTypes.string.isRequired,
  onVerificationSuccess: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default EmailVerificationModal;
