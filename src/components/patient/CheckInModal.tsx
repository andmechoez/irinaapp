import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { usePatient } from '../../App';
import { Check, Calendar, Activity, CheckCircle2, History } from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
}

export default function CheckInModal({ isOpen, onClose, selectedDate }: CheckInModalProps) {
  const { state, dispatch } = usePatient();
  const { evaluacion } = state;
  const todayLog = state.diario?.[selectedDate];
  const habitos = todayLog?.habitos || {};
  const isAlreadyCompleted = !!habitos.completado || Object.keys(habitos).length > 0;

  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  const painEmojis = [
    { level: 1, emoji: '😄', label: 'Sin dolor' },
    { level: 2, emoji: '🙂', label: 'Leve' },
    { level: 3, emoji: '😐', label: 'Moderado' },
    { level: 4, emoji: '😟', label: 'Fuerte' },
    { level: 5, emoji: '😫', label: 'Muy fuerte' },
  ];

  const energyEmojis = [
    { level: 1, emoji: '🔋', label: 'Con energía' },
    { level: 2, emoji: '⚡', label: 'Normal' },
    { level: 3, emoji: '🪫', label: 'Baja energía' },
    { level: 4, emoji: '🥱', label: 'Fatigado' },
    { level: 5, emoji: '🛌', label: 'Agotado' },
  ];

  const digestionOptions = [
    { id: 'normal', label: 'Normal', emoji: '👍' },
    { id: 'inflamacion', label: 'Inflamado', emoji: '🎈' },
    { id: 'estreñimiento', label: 'Estreñimiento', emoji: '🧱' },
    { id: 'diarrea', label: 'Diarrea', emoji: '💧' },
  ];

  const [localHabits, setLocalHabits] = useState({
    horasSueno: habitos.horasSueno || null,
    nivelDolor: habitos.nivelDolor || null,
    nivelEnergia: habitos.nivelEnergia || null,
    digestion: (habitos.digestion || null) as 'normal' | 'inflamacion' | 'estreñimiento' | 'diarrea' | null,
    glucosaCapilar: habitos.glucosaCapilar || '',
    presionArterialSistolica: habitos.presionArterialSistolica || '',
    presionArterialDiastolica: habitos.presionArterialDiastolica || '',
  });

  if (!evaluacion) return null;

  const handleSave = () => {
    dispatch({
      type: 'LOG_HABITS',
      payload: {
        fecha: selectedDate,
        habitos: {
          completado: true,
          fechaCompletado: new Date().toISOString(),
          ...(localHabits.horasSueno && { horasSueno: localHabits.horasSueno }),
          ...(localHabits.nivelDolor && { nivelDolor: localHabits.nivelDolor }),
          ...(localHabits.nivelEnergia && { nivelEnergia: localHabits.nivelEnergia }),
          ...(localHabits.digestion && { digestion: localHabits.digestion as any }),
          ...(localHabits.glucosaCapilar && { glucosaCapilar: Number(localHabits.glucosaCapilar) }),
          ...(localHabits.presionArterialSistolica && { presionArterialSistolica: Number(localHabits.presionArterialSistolica) }),
          ...(localHabits.presionArterialDiastolica && { presionArterialDiastolica: Number(localHabits.presionArterialDiastolica) }),
        }
      }
    });
    onClose();
  };

  // Formatear historial de registros diarios
  const historyLogs = Object.keys(state.diario || {})
    .sort((a, b) => b.localeCompare(a))
    .filter(fecha => state.diario[fecha]?.habitos && Object.keys(state.diario[fecha].habitos || {}).length > 0)
    .map(fecha => {
      const h = state.diario[fecha].habitos || {};
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      let labelFecha = fecha;
      if (fecha === todayStr) labelFecha = 'Hoy';
      else if (fecha === yesterdayStr) labelFecha = 'Ayer';
      else {
        const [yyyy, mm, dd] = fecha.split('-');
        labelFecha = `${dd}/${mm}/${yyyy}`;
      }

      const painObj = painEmojis.find(p => p.level === h.nivelDolor);
      const energyObj = energyEmojis.find(e => e.level === h.nivelEnergia);
      const digestionObj = digestionOptions.find(d => d.id === h.digestion);

      return {
        fecha,
        labelFecha,
        h,
        painObj,
        energyObj,
        digestionObj,
      };
    });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Check-in Diario de Hábitos">
      <div className="space-y-5">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-border/50">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 text-sm font-bold text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'form'
                ? 'border-salud-blue text-salud-blue'
                : 'border-transparent text-text-tertiary hover:text-text-primary'
            }`}
          >
            Check-in de Hoy
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-sm font-bold text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-salud-blue text-salud-blue'
                : 'border-transparent text-text-tertiary hover:text-text-primary'
            }`}
          >
            <History size={14} />
            <span>Historial Diario ({historyLogs.length})</span>
          </button>
        </div>

        {activeTab === 'form' ? (
          <div className="space-y-6">
            {isAlreadyCompleted && (
              <div className="p-3.5 rounded-xl bg-salud-green/10 border border-salud-green/30 text-salud-green flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold">¡Check-in de hoy guardado!</p>
                  <p className="text-[11px] opacity-90 mt-0.5">Tus hábitos de hoy ya se registraron correctamente. Puedes modificar las respuestas si lo necesitas.</p>
                </div>
              </div>
            )}

            <p className="text-sm text-text-secondary">
              Registra tus hábitos de hoy para un mejor seguimiento clínico.
            </p>

            {/* Sueño */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-text-secondary">¿Cuántas horas dormiste?</p>
              <div className="flex flex-wrap gap-2">
                {[4, 5, 6, 7, 8].map((hours) => (
                  <button
                    key={hours}
                    onClick={() => setLocalHabits({ ...localHabits, horasSueno: hours })}
                    className={`px-3 py-1.5 rounded-[var(--radius-sm)] font-bold text-sm transition-colors ${
                      localHabits.horasSueno === hours
                        ? 'bg-salud-blue text-white shadow-sm'
                        : 'bg-bg-elevated text-text-secondary hover:bg-salud-blue/10'
                    }`}
                  >
                    {hours}{hours === 8 ? '+' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Dolor Articular */}
            <div className="space-y-2 pt-4 border-t border-border/50">
              <p className="text-sm font-semibold text-text-secondary">Nivel de dolor articular</p>
              <div className="flex gap-2 justify-between">
                {painEmojis.map(({ level, emoji, label }) => (
                  <button
                    key={level}
                    onClick={() => setLocalHabits({ ...localHabits, nivelDolor: level })}
                    className={`flex flex-col items-center p-2 rounded-[var(--radius-sm)] transition-transform ${
                      localHabits.nivelDolor === level ? 'bg-bg-elevated shadow-sm scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                    title={label}
                  >
                    <span className="text-2xl">{emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energía */}
            <div className="space-y-2 pt-4 border-t border-border/50">
              <p className="text-sm font-semibold text-text-secondary">Nivel de Energía</p>
              <div className="flex gap-2 justify-between">
                {energyEmojis.map(({ level, emoji, label }) => (
                  <button
                    key={level}
                    onClick={() => setLocalHabits({ ...localHabits, nivelEnergia: level })}
                    className={`flex flex-col items-center p-2 rounded-[var(--radius-sm)] transition-transform ${
                      localHabits.nivelEnergia === level ? 'bg-bg-elevated shadow-sm scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                    title={label}
                  >
                    <span className="text-2xl">{emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Digestión */}
            <div className="space-y-2 pt-4 border-t border-border/50">
              <p className="text-sm font-semibold text-text-secondary">Digestión</p>
              <div className="flex flex-wrap gap-2">
                {digestionOptions.map(({ id, label, emoji }) => (
                  <button
                    key={id}
                    onClick={() => setLocalHabits({ ...localHabits, digestion: id as 'normal' | 'inflamacion' | 'estreñimiento' | 'diarrea' })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-sm font-semibold transition-colors ${
                      localHabits.digestion === id
                        ? 'bg-salud-blue-soft border-salud-blue text-salud-blue border'
                        : 'bg-bg-elevated border border-transparent text-text-secondary hover:border-salud-blue/30'
                    }`}
                  >
                    <span>{emoji}</span> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vitales */}
            {(evaluacion.condiciones.includes('Diabetes 1') || evaluacion.condiciones.includes('Diabetes 2')) && (
              <div className="space-y-2 pt-4 border-t border-border/50">
                <p className="text-sm font-semibold text-text-secondary">Glucosa Capilar (mg/dL)</p>
                <Input 
                  type="number" 
                  placeholder="Ej: 110" 
                  value={localHabits.glucosaCapilar}
                  onChange={(e) => setLocalHabits({ ...localHabits, glucosaCapilar: e.target.value })}
                />
              </div>
            )}

            {evaluacion.condiciones.includes('Hipertensión') && (
              <div className="space-y-2 pt-4 border-t border-border/50">
                <p className="text-sm font-semibold text-text-secondary">Presión Arterial (SIS / DIA)</p>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="SIS" 
                    value={localHabits.presionArterialSistolica}
                    onChange={(e) => setLocalHabits({ ...localHabits, presionArterialSistolica: e.target.value })}
                    className="text-center"
                  />
                  <span className="text-text-tertiary">/</span>
                  <Input 
                    type="number" 
                    placeholder="DIA" 
                    value={localHabits.presionArterialDiastolica}
                    onChange={(e) => setLocalHabits({ ...localHabits, presionArterialDiastolica: e.target.value })}
                    className="text-center"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button variant="primary" onClick={handleSave} icon={<Check size={18} />}>
                {isAlreadyCompleted ? 'Actualizar Check-in' : 'Guardar Check-in'}
              </Button>
            </div>
          </div>
        ) : (
          /* Pestaña de Historial Diario */
          <div className="space-y-4">
            <p className="text-xs text-text-secondary">
              Consulta tus hábitos registrados en cada día. Los registros se guardan de forma permanente.
            </p>

            {historyLogs.length === 0 ? (
              <div className="text-center p-8 text-text-tertiary bg-bg-elevated rounded-xl">
                <Activity size={32} className="mx-auto mb-2 opacity-50 text-salud-blue" />
                <p className="text-sm font-medium">Aún no has registrado ningún Check-in en tu historial.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {historyLogs.map(entry => (
                  <div key={entry.fecha} className="p-4 rounded-xl bg-bg-elevated border border-border/50 space-y-2">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-salud-blue" />
                        <span className="font-bold text-sm text-text-primary">{entry.labelFecha}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-salud-green/10 text-salud-green border border-salud-green/20">
                        Check-in registrado
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                      {entry.h.horasSueno && (
                        <div className="bg-bg-card p-2 rounded-lg border border-border/40">
                          <span className="text-text-tertiary block text-[10px]">Sueño</span>
                          <span className="font-bold text-text-primary">😴 {entry.h.horasSueno} hrs</span>
                        </div>
                      )}
                      {entry.painObj && (
                        <div className="bg-bg-card p-2 rounded-lg border border-border/40">
                          <span className="text-text-tertiary block text-[10px]">Dolor</span>
                          <span className="font-bold text-text-primary">{entry.painObj.emoji} {entry.painObj.label}</span>
                        </div>
                      )}
                      {entry.energyObj && (
                        <div className="bg-bg-card p-2 rounded-lg border border-border/40">
                          <span className="text-text-tertiary block text-[10px]">Energía</span>
                          <span className="font-bold text-text-primary">{entry.energyObj.emoji} {entry.energyObj.label}</span>
                        </div>
                      )}
                      {entry.digestionObj && (
                        <div className="bg-bg-card p-2 rounded-lg border border-border/40">
                          <span className="text-text-tertiary block text-[10px]">Digestión</span>
                          <span className="font-bold text-text-primary">{entry.digestionObj.emoji} {entry.digestionObj.label}</span>
                        </div>
                      )}
                      {entry.h.glucosaCapilar && (
                        <div className="bg-bg-card p-2 rounded-lg border border-border/40">
                          <span className="text-text-tertiary block text-[10px]">Glucosa</span>
                          <span className="font-bold text-text-primary">🩸 {entry.h.glucosaCapilar} mg/dL</span>
                        </div>
                      )}
                      {entry.h.presionArterialSistolica && (
                        <div className="bg-bg-card p-2 rounded-lg border border-border/40">
                          <span className="text-text-tertiary block text-[10px]">Presión</span>
                          <span className="font-bold text-text-primary">❤️ {entry.h.presionArterialSistolica}/{entry.h.presionArterialDiastolica}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

