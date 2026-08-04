import { ShieldAlert, Plus, Edit, Trash2, Mail, Lock, User, Briefcase, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Avatar from '../../../components/ui/Avatar';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import type { CreateStaffData, StaffRole } from '../../../types/auth';

// =============================================
// Componente: Formulario de Personal
// =============================================
function StaffFormModal({ isOpen, onClose, onSave, isEditing, initialData }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateStaffData) => void;
  isEditing: boolean;
  initialData?: Partial<CreateStaffData>;
}) {
  const [formData, setFormData] = useState<CreateStaffData>({
    email: initialData?.email || '',
    password: '',
    nombre: initialData?.nombre || '',
    apellido: initialData?.apellido || '',
    role: initialData?.role || 'especialista',
    especialidad: initialData?.especialidad || '',
    telefono: initialData?.telefono || '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Profesional' : 'Nuevo Profesional'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary">Nombre *</label>
            <Input
              type="text"
              required
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              icon={<User size={16} />}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary">Apellido</label>
            <Input
              type="text"
              value={formData.apellido}
              onChange={e => setFormData({ ...formData, apellido: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary">Email *</label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              icon={<Mail size={16} />}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary">Contraseña {isEditing ? '(opcional)' : '*'}</label>
            <Input
              type="password"
              required={!isEditing}
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              icon={<Lock size={16} />}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary">Rol de Acceso *</label>
            <Select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value as StaffRole })}
            >
              <option value="especialista">Especialista (Médico/Nutricionista)</option>
              <option value="admin">Administrador</option>
              <option value="staff">Staff Administrativo</option>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary">Teléfono</label>
            <Input
              type="tel"
              value={formData.telefono}
              onChange={e => setFormData({ ...formData, telefono: e.target.value })}
              icon={<Phone size={16} />}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary">Especialidad</label>
          <Input
            type="text"
            placeholder="Ej. Nutrición Clínica, Endocrinología..."
            value={formData.especialidad}
            onChange={e => setFormData({ ...formData, especialidad: e.target.value })}
            icon={<Briefcase size={16} />}
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-border/40">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit">{isEditing ? 'Guardar Cambios' : 'Crear Profesional'}</Button>
        </div>
      </form>
    </Modal>
  );
}

// =============================================
// Admin: Gestión de Personal Médico
// =============================================

export default function StaffManagement() {
  const { user } = useAuth();
  
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .in('role', ['admin', 'especialista', 'staff'])
      .order('created_at', { ascending: false });
      
    if (data) {
      // Map to the format expected by the table
      const mapped = data.map(u => ({
        id: u.id,
        nombre: `${u.nombre || ''} ${u.apellido || ''}`.trim(),
        email: u.email,
        role: u.role,
        estatus: u.is_active ? 'activo' : 'inactivo',
        especialidad: u.especialidad || 'Sin especialidad'
      }));
      setStaffList(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);

  // Protect route
  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <ShieldAlert size={64} className="text-salud-red mb-4 opacity-80" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Acceso Denegado</h2>
        <p className="text-text-secondary max-w-md">
          No tienes permisos de administrador para ver o gestionar el personal de la institución.
        </p>
      </div>
    );
  }

  const handleCreateStaff = async (data: CreateStaffData) => {
    // Para simplificar, actualmente sólo simulamos la creación en el frontend
    // La creación real requiere llamadas a la API de Edge Functions de Supabase (admin.auth.createUser)
    // Ya que no podemos crear usuarios con contraseña desde el cliente sin iniciar sesión como ellos.
    
    if (editingStaff) {
      setStaffList(prev => prev.map(s => s.id === editingStaff.id ? {
        ...s,
        nombre: `${data.nombre} ${data.apellido}`.trim(),
        email: data.email,
        role: data.role,
        especialidad: data.especialidad || 'Sin especialidad'
      } : s));
    } else {
      const newStaff = {
        id: Math.random().toString(36).substr(2, 9),
        nombre: `${data.nombre} ${data.apellido}`.trim(),
        email: data.email,
        role: data.role,
        estatus: 'activo',
        especialidad: data.especialidad || 'Sin especialidad'
      };
      setStaffList(prev => [...prev, newStaff]);
    }
    setEditingStaff(null);
  };

  const handleToggleStatus = (id: string) => {
    if (id === '1') return; // Cannot disable main admin
    setStaffList(prev => prev.map(s => s.id === id ? {
      ...s,
      estatus: s.estatus === 'activo' ? 'inactivo' : 'activo'
    } : s));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      <StaffFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingStaff(null); }}
        onSave={handleCreateStaff}
        isEditing={!!editingStaff}
        initialData={editingStaff ? {
          nombre: editingStaff.nombre.split(' ')[0],
          apellido: editingStaff.nombre.split(' ').slice(1).join(' '),
          email: editingStaff.email,
          role: editingStaff.role,
          especialidad: editingStaff.especialidad
        } : undefined}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Gestión de Personal</h1>
          <p className="text-text-secondary text-sm mt-1">
            Administra los accesos y roles del equipo médico de la institución.
          </p>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Nuevo Profesional
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-elevated/50 border-b border-border/50">
                <th className="p-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Profesional</th>
                <th className="p-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Rol de Acceso</th>
                <th className="p-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Especialidad</th>
                <th className="p-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Estado</th>
                <th className="p-4 text-xs font-bold text-text-tertiary uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center p-8">Cargando personal...</td></tr>
              ) : staffList.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-8 text-text-tertiary">No hay personal registrado</td></tr>
              ) : staffList.map((staff) => (
                <tr key={staff.id} className={`border-b border-border/40 hover:bg-bg-elevated/30 transition-colors ${staff.estatus === 'inactivo' ? 'opacity-60' : ''}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar nombre={staff.nombre} role={staff.role as any} size="sm" />
                      <div>
                        <p className="font-bold text-text-primary text-sm">{staff.nombre}</p>
                        <p className="text-xs text-text-secondary">{staff.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                      staff.role === 'admin' ? 'bg-salud-purple-soft text-salud-purple border border-salud-purple/20' :
                      staff.role === 'especialista' ? 'bg-salud-blue-soft text-salud-blue border border-salud-blue/20' :
                      'bg-salud-green-soft text-salud-green border border-salud-green/20'
                    }`}>
                      {staff.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-text-primary">{staff.especialidad}</td>
                  <td className="p-4">
                    {staff.estatus === 'activo' 
                      ? <Badge variant="success" dot>Activo</Badge> 
                      : <Badge variant="warning" dot>Inactivo</Badge>
                    }
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setEditingStaff(staff); setIsModalOpen(true); }}
                        className="p-1.5 text-text-tertiary hover:text-salud-blue hover:bg-salud-blue-soft/50 rounded-md transition-colors cursor-pointer" title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(staff.id)}
                        className={`p-1.5 text-text-tertiary rounded-md transition-colors cursor-pointer ${staff.id === '1' ? 'opacity-50 cursor-not-allowed' : 'hover:text-salud-red hover:bg-salud-red-soft/50'}`} 
                        title={staff.estatus === 'activo' ? 'Desactivar' : 'Activar'} 
                        disabled={staff.id === '1'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
