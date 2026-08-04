import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import AlertBanner from '../../../components/ui/AlertBanner';
import Badge from '../../../components/ui/Badge';
import { Plus, Trash2, Clock, BellRing, Save } from 'lucide-react';

interface Schedule {
  id: string;
  tipo: string;
  hora_envio: string;
  titulo: string;
  mensaje: string;
  url: string;
  is_active: boolean;
}

export default function NotificationSettings() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New schedule form
  const [newSchedule, setNewSchedule] = useState({
    tipo: 'recordatorio',
    hora_envio: '10:00', // Format: HH:MM
    titulo: '',
    mensaje: '',
    url: '/app/dashboard'
  });

  const fetchSchedules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notification_schedules')
      .select('*')
      .order('hora_envio', { ascending: true });

    if (error) {
      setError('Error al cargar horarios: ' + error.message);
    } else {
      // Supabase TIME is HH:MM:SS, we truncate to HH:MM for input compatibility
      const formatted = (data || []).map(s => ({
        ...s,
        hora_envio: s.hora_envio.substring(0, 5)
      }));
      setSchedules(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSchedules();
  }, []);

  const handleAdd = async () => {
    if (!newSchedule.titulo || !newSchedule.mensaje || !newSchedule.hora_envio) {
      setError('Por favor completa los campos requeridos (Hora, Título, Mensaje).');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Format TIME for postgres (HH:MM:00)
    const timeFormatted = `${newSchedule.hora_envio}:00`;

    const { error: insertError } = await supabase.from('notification_schedules').insert({
      tipo: newSchedule.tipo,
      hora_envio: timeFormatted,
      titulo: newSchedule.titulo,
      mensaje: newSchedule.mensaje,
      url: newSchedule.url,
      is_active: true
    });

    if (insertError) {
      setError('Error al crear horario: ' + insertError.message);
    } else {
      setSuccess('Horario creado con éxito.');
      setNewSchedule({ tipo: 'recordatorio', hora_envio: '10:00', titulo: '', mensaje: '', url: '/app/dashboard' });
      fetchSchedules();
    }
    setSaving(false);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('notification_schedules')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (!error) {
      setSchedules(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este horario?')) return;
    
    const { error } = await supabase
      .from('notification_schedules')
      .delete()
      .eq('id', id);
    
    if (error) {
      setError('Error al eliminar: ' + error.message);
    } else {
      setSchedules(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Horarios de Notificaciones</h1>
        <p className="text-text-secondary text-sm mt-1">
          Configura alertas automáticas que se enviarán a todos los pacientes a una hora específica.
        </p>
      </div>

      {error && <AlertBanner variant="danger" message={error} dismissible onClose={() => setError(null)} />}
      {success && <AlertBanner variant="success" message={success} dismissible onClose={() => setSuccess(null)} />}

      <Card padding="lg" className="border-salud-blue/20">
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <BellRing size={20} className="text-salud-blue" />
          Crear Nuevo Recordatorio Global
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold mb-1">Hora (24h) *</label>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="time"
                value={newSchedule.hora_envio}
                onChange={(e) => setNewSchedule({...newSchedule, hora_envio: e.target.value})}
                className="w-full bg-bg-primary border border-border rounded-[var(--radius-md)] px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-salud-primary/20"
                step="900" // 15 minutes chunks ideally
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold mb-1">Tipo</label>
            <select
              value={newSchedule.tipo}
              onChange={(e) => setNewSchedule({...newSchedule, tipo: e.target.value})}
              className="w-full bg-bg-primary border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-salud-primary/20"
            >
              <option value="agua">Hidratación (Agua)</option>
              <option value="comida">Comidas</option>
              <option value="motivacional">Motivacional</option>
              <option value="recordatorio">General</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Título de la Notificación *</label>
            <Input
              value={newSchedule.titulo}
              onChange={(e) => setNewSchedule({...newSchedule, titulo: e.target.value})}
              placeholder="Ej: ¡Hora de un vaso de agua!"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-semibold mb-1">Mensaje *</label>
            <Input
              value={newSchedule.mensaje}
              onChange={(e) => setNewSchedule({...newSchedule, mensaje: e.target.value})}
              placeholder="Ej: Mantente hidratado para lograr tu objetivo."
            />
          </div>
          <div className="md:col-span-1">
            <Button onClick={handleAdd} disabled={saving} className="w-full justify-center">
              <Plus size={18} className="mr-2" />
              Añadir Regla
            </Button>
          </div>
        </div>
      </Card>

      <h2 className="text-xl font-bold mt-8 mb-4">Reglas Activas</h2>
      {loading ? (
        <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-salud-primary border-t-transparent rounded-full animate-spin"></div></div>
      ) : schedules.length === 0 ? (
        <Card padding="lg" className="text-center text-text-tertiary">
          No tienes ninguna regla programada. Añade una arriba.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map(schedule => (
            <Card key={schedule.id} className="flex flex-col h-full hover:border-salud-blue/30 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={schedule.is_active ? 'success' : 'default'} dot>
                    {schedule.hora_envio}
                  </Badge>
                  <span className="text-xs uppercase tracking-wider font-semibold text-text-tertiary">{schedule.tipo}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleToggle(schedule.id, schedule.is_active)}
                    className="p-1.5 hover:bg-bg-elevated rounded-md text-text-secondary transition-colors"
                    title={schedule.is_active ? "Desactivar" : "Activar"}
                  >
                    <Save size={16} className={schedule.is_active ? 'text-salud-green' : ''} />
                  </button>
                  <button 
                    onClick={() => handleDelete(schedule.id)}
                    className="p-1.5 hover:bg-red-50 rounded-md text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-text-primary mb-1">{schedule.titulo}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{schedule.mensaje}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
