import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Home, UtensilsCrossed, TrendingUp, ChefHat, UserCircle, HeartPulse, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePatient } from '../App';
import Avatar from '../components/ui/Avatar';
import { supabase } from '../lib/supabase';
import NotificationOnboarding from '../components/patient/NotificationOnboarding';

// =============================================
// Patient Layout — Portal del Paciente
// Bottom nav (mobile) + Sidebar (desktop) + Content
// =============================================

const NAV_ITEMS = [
  { path: '/app/dashboard', label: 'Inicio', icon: Home },
  { path: '/app/menu', label: 'Menú', icon: UtensilsCrossed },
  { path: '/app/progreso', label: 'Progreso', icon: TrendingUp },
  { path: '/app/recetas', label: 'Recetas', icon: ChefHat },
  { path: '/app/perfil', label: 'Perfil', icon: UserCircle },
];

export default function PatientLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, dispatch: authDispatch } = useAuth();
  const { state: patientState, dispatch: patientDispatch } = usePatient();

  const handleLogout = async () => {
    patientDispatch({ type: 'RESET' });
    authDispatch({ type: 'LOGOUT' });
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-dvh bg-bg-primary flex">
      <NotificationOnboarding />
      
      {/* ========== SIDEBAR (Desktop) ========== */}
      <aside className="hidden lg:flex flex-col w-[220px] bg-slate-900 text-white fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-out">
        {/* Branding */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-salud-blue to-salud-green flex items-center justify-center flex-shrink-0">
            <HeartPulse size={20} className="text-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-base font-extrabold tracking-tight leading-none">AVIVA</h1>
            <p className="text-[10px] text-slate-400 font-medium truncate">Portal del Paciente</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5
                  rounded-[var(--radius-md)] text-sm font-medium
                  transition-all duration-200 cursor-pointer
                  ${isActive
                    ? 'bg-salud-blue text-white shadow-lg shadow-salud-blue/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3">
            <Avatar nombre={patientState.evaluacion?.nombre || 'Paciente'} role="paciente" size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{patientState.evaluacion?.nombre || user?.email}</p>
              <p className="text-[11px] text-slate-400 truncate">Paciente</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-[220px] min-w-0 w-full overflow-x-hidden">

        <main className="flex-1 px-4 lg:px-8 pt-6 pb-24 lg:py-8 overflow-y-auto overflow-x-hidden">
          <div className="w-full mx-auto min-w-0">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ========== BOTTOM NAV (Mobile) ========== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border/40 z-40 flex items-center justify-around pb-safe">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-colors ${
                isActive ? 'text-salud-blue' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-salud-blue/10' : ''}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-salud-blue' : ''}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
