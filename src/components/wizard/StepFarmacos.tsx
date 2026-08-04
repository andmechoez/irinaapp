import { Pill, Bone } from 'lucide-react';
import Textarea from '../ui/Textarea';
import { useSystemOptions } from '../../contexts/SystemOptionsContext';

interface StepFarmacosProps {
  medicamentos: string[];
  medicamentosActuales: string;
  restriccionesFisicas: string[];
  alergias: string[];
  onToggleArray: (field: 'medicamentos' | 'restriccionesFisicas' | 'alergias', value: string) => void;
  onUpdate: (field: string, value: string) => void;
}

export default function StepFarmacos({ medicamentos, medicamentosActuales, restriccionesFisicas, alergias, onToggleArray, onUpdate }: StepFarmacosProps) {
  const { getOptionsByCategory } = useSystemOptions();
  
  const opcionesMedicamentos = getOptionsByCategory('medicamento');
  const opcionesAlergias = getOptionsByCategory('alergia');
  const opcionesRestricciones = getOptionsByCategory('restriccion_fisica');

  return (
    <div className="space-y-6 animate-slide-right">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">Fármacos y Digestión</h2>
        <p className="text-text-secondary text-sm">
          Esta información nos permite evitar interacciones fármaco-nutriente y adaptar las texturas.
        </p>
      </div>

      {/* Medicamentos */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-salud-blue">
          <Pill size={18} />
          <h3 className="font-bold text-text-primary text-sm">Medicamentos de uso continuo</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {opcionesMedicamentos.map((opcion) => {
            const isActive = medicamentos.includes(opcion.valor);
            return (
              <button
                key={opcion.id}
                onClick={() => onToggleArray('medicamentos', opcion.valor)}
                className={`px-3 py-1.5 rounded-[var(--radius-full)] text-sm font-semibold transition-colors border ${
                  isActive 
                    ? 'bg-salud-blue text-white border-salud-blue' 
                    : 'bg-bg-elevated text-text-secondary border-transparent hover:border-salud-blue/30'
                }`}
              >
                {opcion.icono && <span className="mr-1">{opcion.icono}</span>}
                {opcion.valor}
              </button>
            );
          })}
        </div>
        
        {/* Otros medicamentos (texto libre) */}
        <div className="mt-4">
          <label htmlFor="otrosMeds" className="block text-sm font-semibold text-text-primary mb-2">
            Otros medicamentos (Especifica)
          </label>
          <Textarea
            id="otrosMeds"
            value={medicamentosActuales || ''}
            onChange={(e) => onUpdate('medicamentosActuales', e.target.value)}
            placeholder="Ej. Eutirox 50mcg, Omeprazol..."
            className="min-h-[80px]"
          />
        </div>
      </div>

      <div className="h-px bg-border/60" />

      {/* Alergias */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-salud-red">
          <Pill size={18} />
          <h3 className="font-bold text-text-primary text-sm">Alergias (Alimentos o Medicamentos)</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {opcionesAlergias.map((opcion) => {
            const isActive = alergias.includes(opcion.valor);
            return (
              <button
                key={opcion.id}
                onClick={() => onToggleArray('alergias', opcion.valor)}
                className={`px-3 py-1.5 rounded-[var(--radius-full)] text-sm font-semibold transition-colors border ${
                  isActive 
                    ? 'bg-salud-red text-white border-salud-red' 
                    : 'bg-bg-elevated text-text-secondary border-transparent hover:border-salud-red/30'
                }`}
              >
                {opcion.icono && <span className="mr-1">{opcion.icono}</span>}
                {opcion.valor}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-border/60" />

      {/* Restricciones Físicas */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-salud-amber">
          <Bone size={18} />
          <h3 className="font-bold text-text-primary text-sm">Condiciones Físicas y Digestivas</h3>
        </div>
        <div className="space-y-2">
          {opcionesRestricciones.map((opcion) => {
            const isActive = restriccionesFisicas.includes(opcion.valor);
            return (
              <button
                key={opcion.id}
                onClick={() => onToggleArray('restriccionesFisicas', opcion.valor)}
                className={`w-full flex items-center justify-between p-3 rounded-[var(--radius-md)] border-2 transition-all duration-200 ${
                  isActive
                    ? 'border-salud-amber bg-salud-amber-soft'
                    : 'border-border bg-bg-card hover:border-salud-amber/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{opcion.icono || '⚠'}</span>
                  <span className={`text-sm font-semibold ${isActive ? 'text-salud-amber' : 'text-text-primary'}`}>
                    {opcion.valor}
                  </span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isActive ? 'border-salud-amber bg-salud-amber' : 'border-text-tertiary'
                }`}>
                  {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
