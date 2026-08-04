import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Users, ShieldAlert, LogOut, 
  ChefHat, LayoutDashboard, HeartPulse, Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useInstitution } from '../contexts/InstitutionContext';
import Avatar from '../components/ui/Avatar';
import { supabase } from '../lib/supabase';

// =============================================
// Staff Layout — Portal del Personal Médico
// Sidebar + BottomNav + Content
// =============================================

interface NavItem {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/staff/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { path: '/staff/pacientes', label: 'Pacientes', icon: Users },
  { path: '/staff/recetas', label: 'Recetas', icon: ChefHat },
];

export default function StaffLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, dispatch } = useAuth();
  const { institution } = useInstitution();

  const handleLogout = async () => {
    dispatch({ type: 'LOGOUT' });
    await supabase.auth.signOut();
    navigate('/');
  };

  const filteredNav = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  const isActivePath = (path: string) => {
    if (path === '/staff/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin': return 'Administrador';
      case 'especialista': return 'Especialista';
      case 'staff': return 'Personal';
      default: return '';
    }
  };

  return (
    <div className="min-h-dvh bg-bg-primary flex overflow-x-hidden">
      {/* ========== SIDEBAR (Desktop) ========== */}
      <aside className="hidden lg:flex flex-col w-[220px] bg-slate-900 text-white fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-out">
        {/* Branding */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-salud-blue to-salud-green flex items-center justify-center flex-shrink-0">
            <HeartPulse size={20} className="text-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-base font-extrabold tracking-tight leading-none">AVIVA</h1>
            <p className="text-[10px] text-slate-400 font-medium truncate">{institution.nombre}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {filteredNav.map(({ path, label, icon: Icon }) => {
            const isActive = isActivePath(path);
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
          {isAdmin && (
            <div className="mt-6">
              <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Administración</p>
              <Link to="/staff/contenido" className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/5`}>
                <Database size={18} /> <span>Gestión y Contenido</span>
              </Link>
              <Link to="/staff/admin/personal" className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/5`}>
                <ShieldAlert size={18} /> <span>Equipo Médico</span>
              </Link>
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3">
            <Avatar nombre={user?.nombre || ''} role={user?.role} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.nombre}</p>
              <p className="text-[11px] text-slate-400 truncate">{getRoleLabel()}</p>
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
      <div className="flex-1 flex flex-col transition-all duration-300 lg:ml-[220px] min-w-0 w-full">
        <main className="flex-1 px-4 lg:px-8 pt-6 pb-24 lg:py-8 overflow-y-auto overflow-x-hidden">
          <div className="w-full mx-auto min-w-0">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ========== BOTTOM NAV (Mobile) ========== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border/40 z-40 flex items-center overflow-x-auto scrollbar-hide pb-safe">
        {filteredNav.map(({ path, label, icon: Icon }) => {
          const isActive = isActivePath(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-2 gap-1 transition-colors ${
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
        {isAdmin && (
          <>
            <button
              onClick={() => navigate('/staff/contenido')}
              className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-2 gap-1 transition-colors ${
                isActivePath('/staff/contenido') ? 'text-salud-blue' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActivePath('/staff/contenido') ? 'bg-salud-blue/10' : ''}`}>
                <Database size={20} strokeWidth={isActivePath('/staff/contenido') ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-semibold ${isActivePath('/staff/contenido') ? 'text-salud-blue' : ''}`}>
                Datos
              </span>
            </button>
            <button
              onClick={() => navigate('/staff/admin/personal')}
              className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-2 gap-1 transition-colors ${
                isActivePath('/staff/admin/personal') ? 'text-salud-blue' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActivePath('/staff/admin/personal') ? 'bg-salud-blue/10' : ''}`}>
                <ShieldAlert size={20} strokeWidth={isActivePath('/staff/admin/personal') ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-semibold ${isActivePath('/staff/admin/personal') ? 'text-salud-blue' : ''}`}>
                Equipo
              </span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
