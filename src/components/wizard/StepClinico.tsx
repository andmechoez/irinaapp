import Input from '../ui/Input';
import type { CondicionMedica, SystemOption } from '../../types';
import { useSystemOptions } from '../../contexts/SystemOptionsContext';
import { calcularHomaIr } from '../../utils/formulas';

interface StepClinicoProps {
  condiciones: CondicionMedica[];
  laboratorios: { glucosa?: number; insulina?: number; homaIr?: number; presionArterial?: string; perfilLipidico?: string; };
  onToggle: (condicion: CondicionMedica) => void;
  onUpdateLaboratorio: (field: string, value: string | number) => void;
}

// Ya no usamos el objeto hardcodeado, usamos el icono de la base de datos

export default function StepClinico({ condiciones, laboratorios, onToggle, onUpdateLaboratorio }: StepClinicoProps) {
  const { getOptionsByCategory } = useSystemOptions();
  const dbCondiciones = getOptionsByCategory('condicion');
  
  const fallbackCondiciones: SystemOption[] = [
    { id: 'c1', valor: 'Diabetes (Cualquier tipo)', icono: '🩸', categoria: 'condicion', activo: true },
    { id: 'c2', valor: 'Hipertensión', icono: '🫀', categoria: 'condicion', activo: true },
    { id: 'c3', valor: 'Dislipidemia / Colesterol', icono: '🩸', categoria: 'condicion', activo: true },
    { id: 'c4', valor: 'SOP (Ovarios Poliquísticos)', icono: '♀️', categoria: 'condicion', activo: true },
  ];

  const condicionesDinamicas = dbCondiciones.length > 0 ? dbCondiciones : fallbackCondiciones;

  const showLabs = condiciones.length > 0 && !condiciones.includes('ninguno');
  const homa = calcularHomaIr(laboratorios.glucosa, laboratorios.insulina);

  const handleToggle = (condicion: CondicionMedica) => {
    onToggle(condicion);
  };

  const handleNinguno = () => {
    onToggle('ninguno');
  };

  const handleGlucosaChange = (val: number | '') => {
    onUpdateLaboratorio('glucosa', val);
    if (typeof val === 'number' && laboratorios.insulina) {
      const res = calcularHomaIr(val, laboratorios.insulina);
      if (res.valor) onUpdateLaboratorio('homaIr', res.valor);
    }
  };

  const handleInsulinaChange = (val: number | '') => {
    onUpdateLaboratorio('insulina', val);
    if (typeof val === 'number' && laboratorios.glucosa) {
      const res = calcularHomaIr(laboratorios.glucosa, val);
      if (res.valor) onUpdateLaboratorio('homaIr', res.valor);
    }
  };

  return (
    <div className="space-y-6 animate-slide-right">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">Perfil Clínico</h2>
        <p className="text-text-secondary">
          Selecciona las condiciones médicas que presentas actualmente
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {condicionesDinamicas.map((item) => {
          const isSelected = condiciones.includes(item.valor as CondicionMedica);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleToggle(item.valor as CondicionMedica)}
              className={`
                flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border-2 text-left transition-all duration-200 cursor-pointer
                ${isSelected
                  ? 'border-salud-red bg-salud-red-soft text-text-primary shadow-sm'
                  : 'border-border bg-bg-card text-text-secondary hover:border-salud-red/40'
                }
              `}
            >
              <span className="text-2xl">{item.icono || '🩺'}</span>
              <span className="font-semibold text-sm leading-tight">{item.valor}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleNinguno}
        className={`
          w-full p-4 rounded-[var(--radius-md)] border-2 font-semibold transition-all duration-200 cursor-pointer
          ${condiciones.includes('ninguno')
            ? 'border-text-secondary bg-bg-elevated text-text-primary'
            : 'border-border bg-bg-card text-text-secondary hover:border-text-tertiary'
          }
        `}
      >
        Ninguno / Completamente Sano
      </button>

      {/* Laboratorios Opcionales */}
      <div className={`transition-all duration-500 overflow-hidden ${showLabs ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
        <div className="bg-bg-elevated/50 p-4 rounded-[var(--radius-lg)] border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-text-primary">Datos de Laboratorio (Opcional)</h3>
            {homa.valor && (
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                homa.riesgo === 'alto' ? 'bg-salud-red-soft text-salud-red border-salud-red/30' :
                homa.riesgo === 'moderado' ? 'bg-salud-amber-soft text-salud-amber border-salud-amber/30' :
                'bg-salud-green-soft text-salud-green border-salud-green/30'
              }`}>
                HOMA-IR: {homa.valor} ({homa.riesgo.toUpperCase()})
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Glucosa en ayunas (mg/dL)</label>
                <Input
                  type="number"
                  placeholder="Ej: 95"
                  value={laboratorios.glucosa || ''}
                  onChange={(e) => handleGlucosaChange(e.target.value ? Number(e.target.value) : '')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Insulina basal (µU/mL)</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Ej: 12.5"
                  value={laboratorios.insulina || ''}
                  onChange={(e) => handleInsulinaChange(e.target.value ? Number(e.target.value) : '')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Presión Arterial (Ej: 120/80)</label>
                <Input
                  type="text"
                  placeholder="120/80"
                  value={laboratorios.presionArterial || ''}
                  onChange={(e) => onUpdateLaboratorio('presionArterial', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">Perfil Lipídico / Colesterol</label>
                <Input
                  type="text"
                  placeholder="Ej: Colesterol Total 220"
                  value={laboratorios.perfilLipidico || ''}
                  onChange={(e) => onUpdateLaboratorio('perfilLipidico', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
