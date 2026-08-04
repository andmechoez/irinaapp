import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useSystemOptions } from '../../../contexts/SystemOptionsContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import { 
  Plus, Trash2, Edit2, Search, AlertCircle, RefreshCw
} from 'lucide-react';
import type { SystemOption } from '../../../types';

export default function SystemOptionsManagement() {
  const { refreshOptions } = useSystemOptions();
  const [options, setOptions] = useState<SystemOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formCategoria, setFormCategoria] = useState<SystemOption['categoria']>('condicion');
  const [formValor, setFormValor] = useState('');
  const [formIcono, setFormIcono] = useState('');

  const categorias = [
    { id: 'condicion', label: 'Condiciones Médicas' },
    { id: 'alergia', label: 'Alergias' },
    { id: 'medicamento', label: 'Medicamentos' },
    { id: 'restriccion_fisica', label: 'Restricciones' }
  ] as const;

  const [activeTab, setActiveTab] = useState<SystemOption['categoria']>('condicion');

  const fetchAllOptions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('system_options')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setOptions(data as SystemOption[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllOptions();
  }, []);

  const handleOpenModal = (opt?: SystemOption) => {
    if (opt) {
      setEditingId(opt.id);
      setFormCategoria(opt.categoria);
      setFormValor(opt.valor);
      setFormIcono(opt.icono || '');
    } else {
      setEditingId(null);
      setFormCategoria(activeTab);
      setFormValor('');
      setFormIcono('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValor.trim()) return;
    
    setIsSubmitting(true);
    
    const payload = {
      categoria: formCategoria,
      valor: formValor.trim(),
      icono: formIcono.trim() || null,
      activo: true
    };

    if (editingId) {
      await supabase.from('system_options').update(payload).eq('id', editingId);
    } else {
      await supabase.from('system_options').insert(payload);
    }

    await fetchAllOptions();
    await refreshOptions(); // Update global context
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta opción? Los pacientes que ya la tengan asignada la conservarán como texto en su perfil.')) return;
    
    await supabase.from('system_options').delete().eq('id', id);
    await fetchAllOptions();
    await refreshOptions();
  };

  const filteredOptions = options
    .filter(o => o.categoria === activeTab)
    .filter(o => o.valor.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in pb-12 w-full mx-auto">
      {/* Header */}
      <div className="flex justify-end mb-2">
        <Button onClick={() => handleOpenModal()} icon={<Plus size={18} />} className="shadow-sm">
          Añadir Opción
        </Button>
      </div>

      <Card className="overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-border/60 hide-scrollbar bg-bg-card">
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`
                px-5 py-3.5 text-sm font-bold whitespace-nowrap transition-colors cursor-pointer
                border-b-2 
                ${activeTab === cat.id 
                  ? 'border-salud-blue text-salud-blue bg-salud-blue-soft/10' 
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
                }
              `}
            >
              {cat.label}
              <Badge variant="default" className="ml-2 text-[10px]">
                {options.filter(o => o.categoria === cat.id).length}
              </Badge>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-border/60 bg-bg-elevated/30 flex items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input
              type="text"
              placeholder={`Buscar en ${categorias.find(c => c.id === activeTab)?.label}...`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-border/60 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-salud-blue/50"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={fetchAllOptions} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="bg-bg-elevated/50 text-xs uppercase font-bold text-text-tertiary border-b border-border/60">
              <tr>
                <th className="px-5 py-3 w-16 text-center">Ícono</th>
                <th className="px-5 py-3">Valor / Etiqueta</th>
                <th className="px-5 py-3 w-32">Estado</th>
                <th className="px-5 py-3 w-24 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-text-tertiary">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                    Cargando opciones...
                  </td>
                </tr>
              ) : filteredOptions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-text-tertiary">
                    <div className="flex flex-col items-center">
                      <AlertCircle size={32} className="mb-2 text-border" />
                      <p className="font-medium text-text-secondary">No se encontraron opciones</p>
                      <p className="text-xs mt-1">Prueba con otra búsqueda o añade una nueva opción.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOptions.map(opt => (
                  <tr key={opt.id} className="hover:bg-bg-elevated/30 transition-colors">
                    <td className="px-5 py-3 text-center text-xl">{opt.icono || '-'}</td>
                    <td className="px-5 py-3 font-semibold text-text-primary">{opt.valor}</td>
                    <td className="px-5 py-3">
                      {opt.activo ? (
                        <Badge variant="success" dot>Activo</Badge>
                      ) : (
                        <Badge variant="warning" dot>Inactivo</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(opt)}
                          className="p-1.5 text-text-tertiary hover:text-salud-blue hover:bg-salud-blue-soft rounded-md transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(opt.id)}
                          className="p-1.5 text-text-tertiary hover:text-salud-red hover:bg-salud-red-soft rounded-md transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border/60 rounded-[var(--radius-lg)] shadow-xl w-full max-w-md max-h-[90vh] flex flex-col animate-slide-up">
            <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                {editingId ? <Edit2 size={18} className="text-salud-blue" /> : <Plus size={18} className="text-salud-blue" />}
                {editingId ? 'Editar Opción' : 'Nueva Opción'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-tertiary hover:text-text-primary cursor-pointer">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Categoría</label>
                <select
                  value={formCategoria}
                  onChange={e => setFormCategoria(e.target.value as SystemOption['categoria'])}
                  className="w-full p-2 border border-border/60 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-salud-blue/50 text-sm bg-white"
                  disabled={!!editingId}
                >
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Valor / Etiqueta</label>
                <Input 
                  value={formValor}
                  onChange={e => setFormValor(e.target.value)}
                  placeholder="Ej. Hipertensión, Ibuprofeno..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Ícono / Emoji (Opcional)</label>
                <Input 
                  value={formIcono}
                  onChange={e => setFormIcono(e.target.value)}
                  placeholder="Ej. 💉, 🥜"
                  maxLength={5}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || !formValor.trim()}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Opción'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
