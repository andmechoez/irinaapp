import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AuthState, AuthAction, AuthenticatedUser, Permissions } from '../types/auth';
import { getPermissions } from '../types/auth';
import { supabase } from '../lib/supabase';

// =============================================
// Auth Context — Autenticación con Supabase
// =============================================

const initialAuthState: AuthState = { isLoggedIn: false, user: null };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN': {
      return { isLoggedIn: true, user: action.payload };
    }
    case 'LOGOUT': {
      return { isLoggedIn: false, user: null };
    }
    case 'UPDATE_PROFILE': {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...action.payload };
      return { isLoggedIn: true, user: updatedUser };
    }
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  user: AuthenticatedUser | null;
  isLoggedIn: boolean;
  permissions: Permissions | null;
  isStaff: boolean;
  isPatient: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    // Escuchar cambios en la sesión de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Obtener el perfil del usuario desde nuestra tabla `public.users`
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const authUser: AuthenticatedUser = {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            nombre: profile.nombre,
            apellido: profile.apellido,
            institutionId: profile.institution_id,
            especialidad: profile.especialidad,
            telefono: profile.telefono,
            avatarUrl: profile.avatar_url,
            isActive: profile.is_active,
            createdAt: profile.created_at,
          };
          dispatch({ type: 'LOGIN', payload: authUser });
        } else {
          // Si por alguna razón el usuario está en Auth pero no en profiles, lo logueamos out
          supabase.auth.signOut();
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const user = state.user;
  const isLoggedIn = state.isLoggedIn;
  const permissions = user ? getPermissions(user.role) : null;
  const isStaff = !!user && user.role !== 'paciente';
  const isPatient = !!user && user.role === 'paciente';
  const isAdmin = !!user && user.role === 'admin';

  return (
    <AuthContext.Provider value={{ state, dispatch, user, isLoggedIn, permissions, isStaff, isPatient, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
