import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, UtensilsCrossed, TrendingUp, ChefHat, UserCircle } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Inicio', icon: Home },
  { path: '/menu', label: 'Menú', icon: UtensilsCrossed },
  { path: '/progreso', label: 'Progreso', icon: TrendingUp },
  { path: '/recetas', label: 'Recetas', icon: ChefHat },
  { path: '/perfil', label: 'Perfil', icon: UserCircle },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-bg-primary flex flex-col overflow-x-hidden">
      {/* Page Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0 safe-area-bottom">
        <div className="max-w-3xl mx-auto min-w-0 w-full">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-bg-card/95 backdrop-blur-md 
                   border-t border-border/60 safe-area-bottom z-50"
        role="navigation"
        aria-label="Navegación principal"
      >
        <div className="flex items-stretch justify-around max-w-lg mx-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`
                  flex flex-col items-center justify-center gap-1
                  py-3 px-4 min-w-[64px] min-h-[56px]
                  transition-all duration-200 cursor-pointer
                  relative
                  ${isActive
                    ? 'text-salud-blue'
                    : 'text-text-tertiary hover:text-text-secondary'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
                aria-label={label}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-salud-blue rounded-full animate-scale-in" />
                )}
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
