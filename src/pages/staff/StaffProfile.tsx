import { User, Mail, Shield, Key, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

// =============================================
// Staff: Mi Perfil
// =============================================

export default function StaffProfile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="w-full mx-auto space-y-6 animate-fade-in pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Mi Perfil Profesional</h1>
        <p className="text-text-secondary text-sm mt-1">
          Gestiona tu información personal y credenciales de acceso.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Identidad */}
        <div className="md:col-span-1 space-y-6">
          <Card padding="lg" className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar nombre={user.nombre} size="xl" role={user.role} />
            </div>
            <h2 className="text-xl font-bold text-text-primary">{user.nombre}</h2>
            <p className="text-sm text-text-secondary mb-3">{user.email}</p>
            
            <div className="flex justify-center">
              <Badge variant="default" className="uppercase tracking-wider">
                {user.role}
              </Badge>
            </div>
          </Card>

          <Card padding="md">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-text-tertiary" />
                <div>
                  <p className="text-xs text-text-tertiary font-bold uppercase">Nivel de Acceso</p>
                  <p className="text-sm font-medium text-text-primary capitalize">{user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-text-tertiary" />
                <div>
                  <p className="text-xs text-text-tertiary font-bold uppercase">Institución</p>
                  <p className="text-sm font-medium text-text-primary">Clínica AVIVA</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Ajustes */}
        <div className="md:col-span-2 space-y-6">
          
          <Card padding="lg">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <User size={18} /> Datos Personales
            </h3>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">Nombre Completo</label>
                  <Input
                    type="text"
                    defaultValue={user.nombre}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">Teléfono (Opcional)</label>
                  <Input
                    type="tel"
                    placeholder="+593 99 999 9999"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">Especialidad</label>
                  <Input
                    type="text"
                    placeholder="Ej: Nutrición Clínica, Medicina General..."
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button>Actualizar Datos</Button>
              </div>
            </form>
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Key size={18} /> Seguridad
            </h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5 flex items-center gap-2">
                  <Mail size={14} className="text-text-tertiary" /> Correo Electrónico
                </label>
                <Input
                  type="email"
                  defaultValue={user.email}
                  disabled
                  className="opacity-70"
                />
                <p className="text-xs text-text-tertiary mt-1">El correo no puede ser modificado por seguridad.</p>
              </div>
              
              <div className="pt-2 border-t border-border/40 mt-4">
                <p className="text-sm font-semibold text-text-primary mb-3">Cambiar Contraseña</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="password"
                      placeholder="Nueva contraseña"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Confirmar contraseña"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button variant="secondary">Actualizar Contraseña</Button>
              </div>
            </form>
          </Card>

        </div>
      </div>
    </div>
  );
}
