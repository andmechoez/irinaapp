import { useState } from 'react';
import { Settings, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSystemOptions } from '../../contexts/SystemOptionsContext';
import type { SystemOption } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Modal from '../ui/Modal';

export default function SystemOptionsManager() {
  const { options, refreshOptions } = useSystemOptions();
  const [selectedCategory, setSelectedCategory] = useState<SystemOption['categoria']>('condicion');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<{ id?: string, valor: string, icono: string }>({ valor: '', icono: '' });

  const filteredOptions = options.filter(o => o.categoria === selectedCategory);

  const handleOpenModal = (option?: SystemOption) => {
    if (option) {
      setForm({ id: option.id, valor: option.valor, icono: option.icono || '' });
    } else {
      setForm({ valor: '', icono: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.valor) return;
    setIsSubmitting(true);

    try {
      if (form.id) {
        await supabase.from('system_options').update({
          valor: form.valor,
          icono: form.icono || null
        }).eq('id', form.id);
      } else {
        await supabase.from('system_options').insert({
          categoria: selectedCategory,
          valor: form.valor,
          icono: form.icono || null,
          activo: true
        });
      }
      await refreshOptions();
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      alert('Error al guardar opción.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await supabase.from('system_options').update({ activo: !currentStatus }).eq('id', id);
      await refreshOptions();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-salud-blue" />
          <h3 className="text-lg font-bold text-text-primary">Diccionarios Clínicos</h3>
        </div>
        <Button size="sm" icon={<Plus size={16} />} onClick={() => handleOpenModal()}>
          Añadir Opción
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-text-secondary">Categoría:</label>
        <div className="w-64">
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
          >
            <option value="condicion">Condiciones Médicas</option>
            <option value="alergia">Alergias</option>
            <option value="medicamento">Medicamentos Comunes</option>
            <option value="restriccion_fisica">Restricciones Físicas</option>
          </Select>
        </div>
      </div>

      <div className="bg-bg-elevated rounded-lg border border-border overflow-hidden mt-4">
        {filteredOptions.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
            <p>No hay opciones configuradas en esta categoría.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-primary border-b border-border text-text-secondary font-semibold">
              <tr>
                <th className="p-3">Ícono</th>
                <th className="p-3 w-full">Valor</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOptions.map(op => (
                <tr key={op.id} className="border-b border-border/50 last:border-0 hover:bg-bg-primary transition-colors">
                  <td className="p-3 text-xl text-center w-12">{op.icono || '-'}</td>
                  <td className="p-3 font-medium text-text-primary">{op.valor}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(op)}
                        className="p-1.5 text-text-tertiary hover:text-salud-blue transition-colors rounded-md hover:bg-salud-blue-soft/50"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(op.id, op.activo)}
                        className={`p-1.5 transition-colors rounded-md ${op.activo
                            ? 'text-salud-red hover:bg-salud-red-soft/50'
                            : 'text-salud-green hover:bg-salud-green-soft/50'
                          }`}
                        title={op.activo ? "Desactivar" : "Activar"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={form.id ? 'Editar Opción' : 'Nueva Opción'}>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">Nombre de la opción *</label>
            <Input
              placeholder="Ej. Intolerancia al Gluten"
              value={form.valor}
              onChange={(e) => setForm(prev => ({ ...prev, valor: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">Ícono (Emoji opcional)</label>
            <Input
              placeholder="Ej. 🍞"
              value={form.icono}
              onChange={(e) => setForm(prev => ({ ...prev, icono: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSubmitting || !form.valor}>
            {isSubmitting ? 'Guardando...' : 'Guardar Opción'}
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
