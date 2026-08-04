/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { StaffProvider } from './contexts/StaffContext';
import { InstitutionProvider } from './contexts/InstitutionContext';
import { SystemOptionsProvider } from './contexts/SystemOptionsContext';

// Guards
import RoleGuard, { GuestGuard } from './components/guards/RoleGuard';

// Layouts
import StaffLayout from './layouts/StaffLayout';
import PatientLayout from './layouts/PatientLayout';

// Pages — Auth
import Auth from './pages/Auth';

// Pages — Staff
import StaffDashboard from './pages/staff/StaffDashboard';
import PatientList from './pages/staff/PatientList';
import PatientCreate from './pages/staff/PatientCreate';
import PatientDetail from './pages/staff/PatientDetail';
import PatientEvaluate from './pages/staff/PatientEvaluate';
import StaffProfile from './pages/staff/StaffProfile';
import StaffManagement from './pages/staff/admin/StaffManagement';
import ContentManagement from './pages/staff/admin/UnifiedContent';
import InstitutionSettings from './pages/staff/admin/InstitutionSettings';
import RecipeList from './pages/staff/RecipeList';
import RecipeCreate from './pages/staff/RecipeCreate';
import NotificationSettings from './pages/staff/admin/NotificationSettings';

// Pages — Patient (existing, will be adapted)
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Progreso from './pages/Progreso';
import Guias from './pages/Guias';
import Recetas from './pages/Recetas';
import Perfil from './pages/Perfil';

// =============================================
// Patient Context (Ahora exportado e importado desde contexts/)
// =============================================
import { PatientDataProvider, usePatient } from './contexts/PatientContext';
export { usePatient };



// =============================================
// Router — Dual Portal Architecture
// =============================================

const router = createBrowserRouter([
  // ===== PUBLIC: Login =====
  {
    path: '/',
    element: (
      <GuestGuard>
        <Auth />
      </GuestGuard>
    ),
  },

  // ===== STAFF PORTAL =====
  {
    element: (
      <RoleGuard allowedRoles={['admin', 'especialista', 'staff', 'asistente']}>
        <StaffLayout />
      </RoleGuard>
    ),
    children: [
      {
        path: '/staff/dashboard',
        element: <StaffDashboard />,
      },
      {
        path: '/staff/pacientes',
        element: <PatientList />,
      },
      {
        path: '/staff/pacientes/nuevo',
        element: <PatientCreate />,
      },
      {
        path: '/staff/pacientes/:id',
        element: <PatientDetail />,
      },
      {
        path: '/staff/pacientes/:id/evaluar',
        element: <PatientEvaluate />,
      },
      {
        path: '/staff/perfil',
        element: <StaffProfile />,
      },
      {
        path: '/staff/recetas',
        element: <RecipeList />,
      },
      {
        path: '/staff/recetas/nueva',
        element: <RecipeCreate />,
      },
      {
        path: '/staff/admin/personal',
        element: <StaffManagement />,
      },
      {
        path: '/staff/admin/config',
        element: <InstitutionSettings />,
      },

      {
        path: '/staff/admin/notificaciones',
        element: <NotificationSettings />,
      },
      {
        path: '/staff/contenido',
        element: <ContentManagement />,
      },
    ],
  },

  // ===== PATIENT PORTAL =====
  {
    element: (
      <RoleGuard allowedRoles={['paciente']}>
        <PatientDataProvider>
          <PatientLayout />
        </PatientDataProvider>
      </RoleGuard>
    ),
    children: [
      {
        path: '/app/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/app/menu',
        element: <Menu />,
      },
      {
        path: '/app/progreso',
        element: <Progreso />,
      },
      {
        path: '/app/guias',
        element: <Guias />,
      },
      {
        path: '/app/recetas',
        element: <Recetas />,
      },
      {
        path: '/app/perfil',
        element: <Perfil />,
      },
    ],
  },

  // ===== Legacy routes redirect =====
  { path: '/dashboard', element: <Navigate to="/app/dashboard" replace /> },
  { path: '/menu', element: <Navigate to="/app/menu" replace /> },
  { path: '/progreso', element: <Navigate to="/app/progreso" replace /> },
  { path: '/guias', element: <Navigate to="/app/guias" replace /> },
  { path: '/recetas', element: <Navigate to="/app/recetas" replace /> },
  { path: '/perfil', element: <Navigate to="/app/perfil" replace /> },
  { path: '/onboarding', element: <Navigate to="/" replace /> },

  // ===== Catch-all =====
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

// =============================================
// App Root
// =============================================

export default function App() {
  return (
    <>
      <AuthProvider>
        <InstitutionProvider>
          <StaffProvider>
            <SystemOptionsProvider>
              <RouterProvider router={router} />
            </SystemOptionsProvider>
          </StaffProvider>
        </InstitutionProvider>
      </AuthProvider>
      {import.meta.env.DEV && (
        <button 
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/';
          }}
          className="fixed bottom-4 right-4 z-[9999] bg-red-600 text-white p-3 rounded-full shadow-2xl opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          title="Borrar Caché (Solo Dev)"
        >
          <span className="text-xl leading-none">🧹</span>
        </button>
      )}
    </>
  );
}
