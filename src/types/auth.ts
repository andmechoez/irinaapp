// =============================================
// AVIVA — Tipos de Autenticación y Roles
// Plataforma Institucional de Nutrición Clínica
// =============================================

/** Roles disponibles en la plataforma */
export type UserRole = 'admin' | 'especialista' | 'staff' | 'asistente' | 'paciente';

/** Roles que pertenecen al personal médico/institucional */
export type StaffRole = Exclude<UserRole, 'paciente'>;

/** Verificar si un rol es de staff */
export const isStaffRole = (role: UserRole): role is StaffRole => role !== 'paciente';

/** Estado de autenticación extendido */
export interface AuthState {
  isLoggedIn: boolean;
  user: AuthenticatedUser | null;
}

/** Usuario autenticado con metadata completa */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  nombre: string;
  apellido?: string;
  institutionId: string;
  especialidad?: string;
  telefono?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  /** ID del paciente asociado (solo para role === 'paciente') */
  patientId?: string;
}

/** Acciones del reducer de autenticación */
export type AuthAction =
  | { type: 'LOGIN'; payload: AuthenticatedUser }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<AuthenticatedUser> };

/** Datos del formulario de login */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Datos para crear un nuevo miembro del personal */
export interface CreateStaffData {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  role: StaffRole;
  especialidad?: string;
  telefono?: string;
}

/** Permisos del sistema */
export interface Permissions {
  canCreateStaff: boolean;
  canCreatePatients: boolean;
  canEditPatientClinicalData: boolean;
  canViewPatientList: boolean;
  canViewClinicalHistory: boolean;
  canCreateEvaluation: boolean;
  canViewStaffDashboard: boolean;
  canRegisterDailyHabits: boolean;
  canEditOwnProfile: boolean;
  canViewAssignedMenu: boolean;
  canViewOwnProgress: boolean;
  canViewGuidesAndRecipes: boolean;
  canViewGlobalStats: boolean;
  canManageInstitution: boolean;
}

/** Obtener permisos según el rol */
export const getPermissions = (role: UserRole): Permissions => {
  switch (role) {
    case 'admin':
      return {
        canCreateStaff: true,
        canCreatePatients: true,
        canEditPatientClinicalData: true,
        canViewPatientList: true,
        canViewClinicalHistory: true,
        canCreateEvaluation: true,
        canViewStaffDashboard: true,
        canRegisterDailyHabits: false,
        canEditOwnProfile: true,
        canViewAssignedMenu: false,
        canViewOwnProgress: false,
        canViewGuidesAndRecipes: false,
        canViewGlobalStats: true,
        canManageInstitution: true,
      };
    case 'especialista':
      return {
        canCreateStaff: false,
        canCreatePatients: true,
        canEditPatientClinicalData: true,
        canViewPatientList: true,
        canViewClinicalHistory: true,
        canCreateEvaluation: true,
        canViewStaffDashboard: true,
        canRegisterDailyHabits: false,
        canEditOwnProfile: true,
        canViewAssignedMenu: false,
        canViewOwnProgress: false,
        canViewGuidesAndRecipes: false,
        canViewGlobalStats: true,
        canManageInstitution: false,
      };
    case 'asistente':
    case 'staff':
      return {
        canCreateStaff: false,
        canCreatePatients: true,
        canEditPatientClinicalData: false,
        canViewPatientList: true,
        canViewClinicalHistory: true,
        canCreateEvaluation: false,
        canViewStaffDashboard: true,
        canRegisterDailyHabits: false,
        canEditOwnProfile: true,
        canViewAssignedMenu: false,
        canViewOwnProgress: false,
        canViewGuidesAndRecipes: false,
        canViewGlobalStats: false,
        canManageInstitution: false,
      };
    case 'paciente':
      return {
        canCreateStaff: false,
        canCreatePatients: false,
        canEditPatientClinicalData: false,
        canViewPatientList: false,
        canViewClinicalHistory: false,
        canCreateEvaluation: false,
        canViewStaffDashboard: false,
        canRegisterDailyHabits: true,
        canEditOwnProfile: true,
        canViewAssignedMenu: true,
        canViewOwnProgress: true,
        canViewGuidesAndRecipes: true,
        canViewGlobalStats: false,
        canManageInstitution: false,
      };
  }
};
