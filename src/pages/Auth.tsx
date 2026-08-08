import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, HeartPulse, Building2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// =============================================
// Auth — Login Institucional
// Sin registro público, solo login
// =============================================

export default function Auth() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Detect email verification hash
  useState(() => {
    if (window.location.hash.includes('type=signup') || window.location.hash.includes('type=recovery')) {
      setSuccessMsg('¡Correo verificado con éxito! Iniciando sesión...');
    }
  });

  // If already logged in, redirect
  if (isLoggedIn && user) {
    const redirect = user.role === 'paciente' ? '/app/dashboard' : '/staff/dashboard';
    navigate(redirect, { replace: true });
    return null;
  }

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;
  const canSubmit = isEmailValid && isPasswordValid && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setIsLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error("Auth error:", authError);
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos.'
          : `Error de inicio de sesión: ${authError.message}`
      );
      setIsLoading(false);
      return;
    }

    // El AuthContext.tsx está escuchando el onAuthStateChange
    // y se encargará de despachar el usuario y obtener el perfil.
    setIsLoading(false);
  };



  return (
    <div className="min-h-dvh bg-bg-primary flex flex-col items-center justify-center px-6 safe-area-top safe-area-bottom overflow-x-hidden">
      <div className="w-full max-w-[420px] space-y-8 animate-fade-in">

        {/* Logo & Institutional Branding */}
        <div className="text-center space-y-4 animate-slide-up">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-salud-blue to-salud-green mx-auto flex items-center justify-center shadow-lg shadow-salud-blue/20">
            <HeartPulse size={40} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">AVIVA</h1>
            <p className="text-text-secondary text-base mt-1 flex items-center justify-center gap-1.5">
              <Building2 size={14} />
              Plataforma de Nutrición Clínica
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl border border-border/40 shadow-[var(--shadow-card)] p-6 lg:p-8 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Iniciar sesión</h2>
            <p className="text-sm text-text-secondary mt-0.5">Acceso para personal y pacientes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="auth-email" className="block text-sm font-semibold text-text-primary">
                Correo electrónico
              </label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                icon={<Mail size={18} />}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="auth-password" className="block text-sm font-semibold text-text-primary">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-12"
                  icon={<Lock size={18} />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error & Success */}
            {error && (
              <div className="bg-salud-red-soft border border-salud-red/20 rounded-[var(--radius-md)] px-4 py-2.5 animate-scale-in">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}
            {successMsg && (
              <div className="bg-salud-green-soft border border-salud-green/20 rounded-[var(--radius-md)] px-4 py-2.5 animate-scale-in">
                <p className="text-sm text-salud-green font-bold">{successMsg}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              size="md"
              disabled={!canSubmit}
              icon={isLoading ? undefined : <ArrowRight size={18} />}
            >
              {isLoading ? 'Verificando...' : 'Iniciar sesión'}
            </Button>
          </form>
        </div>



        {/* Footer */}
        <p className="text-center text-[11px] text-text-tertiary leading-relaxed">
          © 2026 AVIVA — Plataforma de Nutrición Clínica
        </p>
      </div>
    </div>
  );
}
