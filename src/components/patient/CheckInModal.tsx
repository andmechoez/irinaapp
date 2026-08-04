import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { usePatient } from '../../App';
import { Check } from 'lucide-react';

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Check-in Diario">
      <div className="space-y-6">
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
            Guardar Check-in
          </Button>
        </div>
      </div>
    </Modal>
  );
}
