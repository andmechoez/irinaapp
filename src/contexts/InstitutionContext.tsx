import { createContext, useContext, type ReactNode } from 'react';

// =============================================
// Institution Context — Datos Institucionales
// =============================================

export interface Institution {
  id: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  logoUrl?: string;
  isActive: boolean;
}

interface InstitutionContextType {
  institution: Institution;
}

const defaultInstitution: Institution = {
  id: 'default-clinic',
  nombre: 'Centro de Nutrición Clínica',
  direccion: '',
  telefono: '',
  logoUrl: '',
  isActive: true,
};

const InstitutionContext = createContext<InstitutionContextType | null>(null);

export function InstitutionProvider({ children }: { children: ReactNode }) {
  // For now, use a static institution. Will be loaded from Supabase in Phase 5.
  const institution = defaultInstitution;

  return (
    <InstitutionContext.Provider value={{ institution }}>
      {children}
    </InstitutionContext.Provider>
  );
}

export function useInstitution(): InstitutionContextType {
  const context = useContext(InstitutionContext);
  if (!context) {
    throw new Error('useInstitution must be used within an InstitutionProvider');
  }
  return context;
}
