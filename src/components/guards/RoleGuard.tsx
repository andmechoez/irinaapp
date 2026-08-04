import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/auth';
import type { ReactNode } from 'react';

// =============================================
// Route Guards — Protección por rol
// =============================================

interface RoleGuardProps {
  children: ReactNode;
  /** Roles permitidos para acceder a esta ruta */
  allowedRoles: UserRole[];
  /** Ruta a la que redirigir si no está autenticado */
  loginRedirect?: string;
  /** Ruta a la que redirigir si el rol no es el correcto */
  fallbackRedirect?: string;
}

/**
 * RoleGuard — Protege rutas según el rol del usuario.
 * 
 * Si el usuario no está autenticado → redirige a login.
 * Si el usuario está autenticado pero no tiene el rol correcto → redirige al portal correcto.
 */
export default function RoleGuard({
  children,
  allowedRoles,
  loginRedirect = '/',
  fallbackRedirect,
}: RoleGuardProps) {
  const { isLoggedIn, user } = useAuth();

  // Not logged in → login page
  if (!isLoggedIn || !user) {
    return <Navigate to={loginRedirect} replace />;
  }

  // Logged in but wrong role → redirect to correct portal
  if (!allowedRoles.includes(user.role)) {
    const redirect = fallbackRedirect || (user.role === 'paciente' ? '/app/dashboard' : '/staff/dashboard');
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}

/**
 * AuthGuard — Solo verifica que el usuario esté autenticado (cualquier rol).
 */
export function AuthGuard({ children, loginRedirect = '/' }: { children: ReactNode; loginRedirect?: string }) {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to={loginRedirect} replace />;
  }

  return <>{children}</>;
}

/**
 * GuestGuard — Solo permite acceso a usuarios NO autenticados (para la página de login).
 */
export function GuestGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn, user } = useAuth();

  if (isLoggedIn && user) {
    const redirect = user.role === 'paciente' ? '/app/dashboard' : '/staff/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}
