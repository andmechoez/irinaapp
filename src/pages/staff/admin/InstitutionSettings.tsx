import { Building2, Save, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import SystemOptionsManager from '../../../components/admin/SystemOptionsManager';

// =============================================
// Admin: Configuración Institucional
// =============================================

export default function InstitutionSettings() {
  const { user } = useAuth();

  // Protect route
  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <Building2 size={64} className="text-text-tertiary mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Acceso Denegado</h2>
        <p className="text-text-secondary max-w-md">
          Esta sección está reservada para administradores. Aquí se gestionan los datos de la institución clínica.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-6 animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Configuración Institucional</h1>
        <p className="text-text-secondary text-sm mt-1">
          Administra la información pública y ajustes globales de la clínica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Logo & Branding */}
        <div className="md:col-span-1 space-y-6">
          <Card padding="lg" className="text-center">
            <h3 className="text-sm font-bold text-text-primary mb-4 text-left">Logo Institucional</h3>
            <div className="w-32 h-32 mx-auto rounded-xl bg-bg-elevated border-2 border-dashed border-border/60 flex items-center justify-center mb-4">
              <Building2 size={40} className="text-text-tertiary" />
            </div>
            <Button variant="secondary" className="w-full justify-center">Subir Nuevo Logo</Button>
            <p className="text-xs text-text-tertiary mt-3">Recomendado: 512x512px, formato PNG o SVG con fondo transparente.</p>
          </Card>

          <Card padding="md">
            <h3 className="text-sm font-bold text-text-primary mb-3">Estilos Globales</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Color Principal</label>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-salud-blue border border-border"></div>
                  <span className="text-sm font-mono text-text-primary">#2563EB</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Datos */}
        <div className="md:col-span-2 space-y-6">
          <Card padding="lg">
            <h3 className="text-lg font-bold text-text-primary mb-5 border-b border-border/40 pb-3">Información General</h3>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-text-primary mb-1.5 flex items-center gap-2">
                    <Building2 size={14} /> Nombre de la Institución
                  </label>
                  <Input
                    type="text"
                    defaultValue="Clínica Nutricional AVIVA"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-text-primary mb-1.5 flex items-center gap-2">
                    <MapPin size={14} /> Dirección Física
                  </label>
                  <Input
                    type="text"
                    defaultValue="Av. Amazonas y Naciones Unidas, Edificio Médico, Piso 4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5 flex items-center gap-2">
                    <Phone size={14} /> Teléfono Principal
                  </label>
                  <Input
                    type="tel"
                    defaultValue="+593 2 222 3333"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5 flex items-center gap-2">
                    <Globe size={14} /> Sitio Web
                  </label>
                  <Input
                    type="url"
                    defaultValue="https://aviva.ec"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-text-primary mb-1.5 flex items-center gap-2">
                    <Mail size={14} /> Correo de Contacto
                  </label>
                  <Input
                    type="email"
                    defaultValue="contacto@aviva.ec"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/40 mt-6">
                <Button icon={<Save size={18} />}>Guardar Cambios</Button>
              </div>
            </form>
          </Card>

          {/* Diccionarios del Sistema */}
          <SystemOptionsManager />
        </div>
      </div>
    </div>
  );
}
