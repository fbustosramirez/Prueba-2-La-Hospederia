
import React, { useState, useEffect } from 'react';
import { Lock, Mail, Home, ArrowLeft, KeyRound, Loader2, AlertCircle, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import * as dataService from '../services/dataService';
import { sendRecoveryEmail } from '../services/emailService';
import { hashPassword } from '../utils/helpers';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'forgot' | 'verify' | 'new-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [generatedCode, setGeneratedCode] = useState('');
  const [targetUser, setTargetUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const users = dataService.getUsers();
    const hashedPassword = await hashPassword(password);

    setTimeout(() => {
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === hashedPassword);

      if (foundUser) {
        if (!foundUser.activo) {
          setError('Su cuenta se encuentra desactivada. Contacte al administrador.');
          setLoading(false);
          return;
        }
        onLogin(foundUser);
      } else {
        setError('Credenciales inválidas. Por favor, verifique sus datos.');
        setLoading(false);
      }
    }, 800);
  };

  const handleStartRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const users = dataService.getUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser) {
      // Generar código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setTargetUser(foundUser);

      const result = await sendRecoveryEmail(foundUser.email, foundUser.nombre, code);

      if (result.success) {
        setView('verify');
      } else {
        setError(result.message);
      }
    } else {
      setError('El correo no corresponde a un usuario autorizado.');
    }
    setLoading(false);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredPin = pin.join('');
    if (enteredPin === generatedCode) {
      setView('new-password');
      setError('');
    } else {
      setError('Código de seguridad incorrecto. Intente de nuevo.');
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('La nueva clave debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (targetUser) {
      const allUsers = dataService.getUsers();
      const hashedPassword = await hashPassword(newPassword);
      const updatedUsers = allUsers.map(u =>
        u.id === targetUser.id ? { ...u, password: hashedPassword } : u
      );
      dataService.saveUsers(updatedUsers);

      setSuccessMsg('¡Contraseña actualizada con éxito!');
      setTimeout(() => {
        setView('login');
        setSuccessMsg('');
        setPassword('');
        setEmail(targetUser.email);
      }, 2000);
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 p-4 font-sans text-slate-900">
      <div className="max-w-md w-full animate-in fade-in duration-500">
        {/* Logo y Encabezado */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-yellow-400 rounded-2xl shadow-xl mb-4 rotate-3 hover:rotate-0 transition-transform">
            <Home className="text-blue-900 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Santa Francisca Romana</h1>
          <p className="text-blue-200 mt-2 font-medium tracking-wide text-sm opacity-80 uppercase tracking-[0.2em]">Gestión de Seguridad</p>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
          <div className="p-8 sm:p-12">

            {/* VISTA: LOGIN */}
            {view === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Iniciar Sesión</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Acceso Autenticado</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Email del Sistema</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario@sfr.cl"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Clave Maestra</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input
                        type={showPass ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600"
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl text-xs font-bold border border-red-100 animate-in slide-in-from-top-2">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Entrar al Sistema'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setError(''); }}
                    className="text-[10px] font-black text-blue-700 hover:text-blue-900 transition-colors uppercase tracking-[0.2em] decoration-2 underline-offset-4 hover:underline"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </div>
              </form>
            )}

            {/* VISTA: OLVIDO (PASO 1) */}
            {view === 'forgot' && (
              <form onSubmit={handleStartRecover} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="text-yellow-600" size={32} />
                  </div>
                  <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Recuperar Acceso</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                    Enviaremos un código de seguridad a su correo institucional.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Email de Registro</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold text-center"
                    placeholder="ejemplo@correo.com"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl text-xs font-bold border border-red-100">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Enviar Código'}
                </button>

                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-gray-800 font-bold text-[10px] uppercase tracking-[0.2em]"
                >
                  <ArrowLeft size={16} /> Volver al Login
                </button>
              </form>
            )}

            {/* VISTA: VERIFICAR PIN (PASO 2) */}
            {view === 'verify' && (
              <form onSubmit={handleVerifyPin} className="space-y-8 text-center">
                <div>
                  <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Verificar Código</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                    Ingrese los 6 dígitos enviados a su email.
                  </p>
                </div>

                <div className="flex justify-between gap-2">
                  {pin.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`pin-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(idx, e.target.value)}
                      className="w-10 h-14 sm:w-12 sm:h-16 text-2xl font-black text-center bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-600 focus:ring-0 outline-none transition-all"
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-red-600 text-[10px] font-black uppercase">{error}</p>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-800 transition-all shadow-lg"
                >
                  Validar Código
                </button>

                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  ¿No recibió nada? <button type="button" onClick={() => setView('forgot')} className="text-blue-600">Reenviar</button>
                </p>
              </form>
            )}

            {/* VISTA: NUEVA CLAVE (PASO 3) */}
            {view === 'new-password' && (
              <form onSubmit={handleSetNewPassword} className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Nueva Contraseña</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
                    Establezca su nueva clave de seguridad maestra.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Nueva Clave</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Confirmar Clave</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold"
                      placeholder="Repita la clave"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-600 text-[10px] font-black uppercase text-center">{error}</p>
                )}

                {successMsg ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-center justify-center gap-2 animate-bounce">
                    <CheckCircle2 size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{successMsg}</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-green-700 transition-all shadow-lg"
                  >
                    Actualizar Clave
                  </button>
                )}
              </form>
            )}

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-200/40 text-[9px] mt-10 font-black uppercase tracking-[0.4em]">
          SF Romana Protocol • Secure End-to-End
        </p>
      </div>
    </div>
  );
};

export default Login;
