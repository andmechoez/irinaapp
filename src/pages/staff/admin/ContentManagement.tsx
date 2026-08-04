import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, HeartPulse, ShieldAlert, Target } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useSystemOptions } from '../../../contexts/SystemOptionsContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';
import type { ClinicalContent } from '../../../types';

function ContentFormModal({ isOpen, onClose, onSave, isEditing, initialData }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ClinicalContent>) => void;
  isEditing: boolean;
  initialData?: Partial<ClinicalContent>;
}) {
  const { getOptionsByCategory } = useSystemOptions();
  const condiciones = getOptionsByCategory('condicion');
  const objetivos = getOptionsByCategory('objetivo');

  const [formData, setFormData] = useState<Partial<ClinicalContent>>({
    type: 'reto',
    title: '',
    description: '',
    icon: '💡',
    trigger_condition: '',
    trigger_objective: '',
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'reto',
        title: initialData.title || '',
        description: initialData.description || '',
        icon: initialData.icon || '💡',
        trigger_condition: initialData.trigger_condition || '',
        trigger_objective: initialData.trigger_objective || '',
        is_active: initialData.is_active ?? true,
      });
    } else {
      setFormData({ type: 'reto', title: '', description: '', icon: '💡', trigger_condition: '', trigger_objective: '', is_active: true });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Contenido' : 'Nuevo Contenido'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary">Tipo *</label>
            <Select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              required
            >
              <option value="reto">Reto Semanal</option>
              <option value="recomendacion">Recomendación</option>
              <option value="rutina">Rutina Física</option>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary">Icono (Emoji)</label>
            <Input
              type="text"
              value={formData.icon || ''}
              onChange={e => setFormData({ ...formData, icon: e.target.value })}
              placeholder="Ej. 🍎"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary">Título *</label>
          <Input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ej. Día sin salero"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary">Descripción *</label>
          <Textarea
            required
            rows={3}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Instrucciones para el paciente..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary">Asignar a Condición (opcional)</label>
            <Select
              value={formData.trigger_condition || ''}
              onChange={e => setFormData({ ...formData, trigger_condition: e.target.value })}
            >
              <option value="">-- Para todos --</option>
              {condiciones.map(c => (
                <option key={c.id} value={c.valor}>{c.valor}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary">Asignar a Objetivo (opcional)</label>
            <Select
              value={formData.trigger_objective || ''}
              onChange={e => setFormData({ ...formData, trigger_objective: e.target.value })}
            >
              <option value="">-- Para todos --</option>
              {objetivos.map(c => (
                <option key={c.id} value={c.valor}>{c.valor}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-border/40">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit">{isEditing ? 'Guardar Cambios' : 'Crear Contenido'}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function ContentManagement() {
  const { user } = useAuth();
  const [contentList, setContentList] = useState<ClinicalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ClinicalContent | null>(null);

  const fetchContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clinical_content')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data && !error) {
      setContentList(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <ShieldAlert size={64} className="text-salud-red mb-4 opacity-80" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Acceso Denegado</h2>
        <p className="text-text-secondary max-w-md">
          No tienes permisos de administrador para gestionar el contenido clínico.
        </p>
      </div>
    );
  }

  const handleSave = async (data: Partial<ClinicalContent>) => {
    if (editingContent) {
      const { error } = await supabase
        .from('clinical_content')
        .update(data)
        .eq('id', editingContent.id);
      if (error) alert('Error al actualizar: ' + error.message);
    } else {
      const { error } = await supabase
        .from('clinical_content')
        .insert([data]);
      if (error) alert('Error al crear: ' + error.message);
    }
    setIsModalOpen(false);
    setEditingContent(null);
    fetchContent();
  };

  const handleToggleStatus = async (item: ClinicalContent) => {
    const { error } = await supabase
      .from('clinical_content')
      .update({ is_active: !item.is_active })
      .eq('id', item.id);
    if (!error) {
      fetchContent();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este contenido?')) {
      await supabase.from('clinical_content').delete().eq('id', id);
      fetchContent();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <ContentFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingContent(null); }}
        onSave={handleSave}
        isEditing={!!editingContent}
        initialData={editingContent || undefined}
      />

      <div className="flex justify-end mb-6">
        <Button icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Crear Nuevo Contenido
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-elevated/50 border-b border-border/50">
                <th className="p-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Tipo</th>
                <th className="p-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Título</th>
                <th className="p-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Asignado a (Reglas)</th>
                <th className="p-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Estado</th>
                <th className="p-4 text-xs font-bold text-text-tertiary uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center p-8">Cargando contenido...</td></tr>
              ) : contentList.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-8 text-text-tertiary">No hay contenido clínico</td></tr>
              ) : contentList.map((item) => (
                <tr key={item.id} className={`border-b border-border/40 hover:bg-bg-elevated/30 transition-colors ${!item.is_active ? 'opacity-60' : ''}`}>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                      item.type === 'reto' ? 'bg-salud-amber-soft text-salud-amber border border-salud-amber/20' :
                      item.type === 'recomendacion' ? 'bg-salud-green-soft text-salud-green border border-salud-green/20' :
                      'bg-salud-blue-soft text-salud-blue border border-salud-blue/20'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <p className="font-bold text-text-primary text-sm line-clamp-1">{item.title}</p>
                        <p className="text-xs text-text-secondary line-clamp-1 max-w-[250px]" title={item.description}>{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {item.trigger_condition || item.trigger_objective ? (
                      <div className="flex flex-col gap-1">
                        {item.trigger_condition && (
                          <span className="text-xs font-semibold bg-bg-elevated border border-border rounded-md px-2 py-0.5 inline-flex items-center gap-1">
                            <HeartPulse size={10} className="text-salud-red" /> {item.trigger_condition}
                          </span>
                        )}
                        {item.trigger_objective && (
                          <span className="text-xs font-semibold bg-bg-elevated border border-border rounded-md px-2 py-0.5 inline-flex items-center gap-1">
                            <Target size={10} className="text-salud-blue" /> {item.trigger_objective}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-text-secondary italic">General (Para todos)</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleToggleStatus(item)} className="cursor-pointer hover:opacity-80 transition-opacity">
                      {item.is_active 
                        ? <Badge variant="success" dot>Activo</Badge> 
                        : <Badge variant="warning" dot>Inactivo</Badge>
                      }
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setEditingContent(item); setIsModalOpen(true); }}
                        className="p-1.5 text-text-tertiary hover:text-salud-blue hover:bg-salud-blue-soft/50 rounded-md transition-colors cursor-pointer" title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-text-tertiary hover:text-salud-red hover:bg-salud-red-soft/50 rounded-md transition-colors cursor-pointer" 
                        title="Eliminar permanentemente"
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
