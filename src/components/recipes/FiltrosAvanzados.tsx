import { useState } from 'react';
import { Activity, Clock, Flame, ShieldAlert, HeartPulse, Tag } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { FiltrosReceta, CondicionMedica, DificultadReceta } from '../../types';
import { getDificultadLabel, RESTRICCIONES_DISPONIBLES, TAGS_DISPONIBLES } from '../../utils/recetaEngine';
import { useSystemOptions } from '../../contexts/SystemOptionsContext';

interface FiltrosAvanzadosProps {
  filtros: FiltrosReceta;
  onUpdate: (f: FiltrosReceta) => void;
  onClose: () => void;
}

export default function FiltrosAvanzados({ filtros, onUpdate, onClose }: FiltrosAvanzadosProps) {
  const [local, setLocal] = useState<FiltrosReceta>({ ...filtros });
  const { getOptionsByCategory } = useSystemOptions();
  const condicionesDinamicas = getOptionsByCategory('condicion');

  const handleApply = () => {
    onUpdate(local);
    onClose();
  };

  const handleClear = () => {
    const cleared: FiltrosReceta = {};
    setLocal(cleared);
    onUpdate(cleared);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Filtros Avanzados">
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        
        {/* GRUPO 1: CLÍNICO */}
        <div className="bg-bg-elevated p-4 rounded-xl border border-border/60">
          <h3 className="text-sm font-extrabold text-salud-red flex items-center gap-2 mb-4">
            <HeartPulse size={18} /> Necesidades Clínicas
          </h3>
          <div className="space-y-5">
            {/* Condición Médica */}
            <div>
              <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Condición Médica Base</p>
              <div className="flex flex-wrap gap-1.5">
                {condicionesDinamicas.map(cond => (
                  <button
                    key={cond.id}
                    onClick={() => setLocal(prev => ({
                      ...prev,
                      condicionMedica: prev.condicionMedica === cond.valor ? undefined : cond.valor as CondicionMedica
                    }))}
                    className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer border ${
                      local.condicionMedica === cond.valor
                        ? 'bg-salud-red text-white border-salud-red shadow-sm'
                        : 'bg-white text-text-secondary border-border hover:border-salud-red/30'
                    }`}
                  >
                    {cond.valor}
                  </button>
                ))}
              </div>
            </div>

            {/* Dietas Especiales */}
            <div>
              <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Dietas Especiales</p>
              <div className="flex flex-wrap gap-1.5">
                {['Vegana', 'Vegetariana', 'Keto', 'Mediterránea', 'Pescatariana'].map(dieta => (
                  <button
                    key={dieta}
                    onClick={() => setLocal(prev => ({
                      ...prev,
                      dietaEspecial: prev.dietaEspecial === dieta ? undefined : dieta
                    }))}
                    className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer border ${
                      local.dietaEspecial === dieta
                        ? 'bg-salud-purple text-white border-salud-purple shadow-sm'
                        : 'bg-white text-text-secondary border-border hover:border-salud-purple/30'
                    }`}
                  >
                    🌿 {dieta}
                  </button>
                ))}
              </div>
            </div>

            {/* Restricciones Alimentarias */}
            <div>
              <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-salud-amber" /> Excluir (Restricciones)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {RESTRICCIONES_DISPONIBLES.map(rest => {
                  const isActive = (local.restricciones || []).includes(rest.value);
                  return (
                    <button
                      key={rest.value}
                      onClick={() => {
                        const current = local.restricciones || [];
                        setLocal(prev => ({
                          ...prev,
                          restricciones: isActive
                            ? current.filter(r => r !== rest.value)
                            : [...current, rest.value]
                        }));
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-salud-amber text-white border-salud-amber shadow-sm'
                          : 'bg-white text-text-secondary border-border hover:border-salud-amber/30'
                      }`}
                    >
                      {rest.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* GRUPO 2: PREPARACIÓN */}
        <div className="bg-bg-elevated p-4 rounded-xl border border-border/60">
          <h3 className="text-sm font-extrabold text-salud-blue flex items-center gap-2 mb-4">
            <Clock size={18} /> Preparación
          </h3>
          <div className="space-y-5">
            {/* Dificultad */}
            <div>
              <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Dificultad</p>
              <div className="flex gap-2 bg-white p-1 rounded-xl border border-border">
                {(['facil', 'media', 'avanzada'] as DificultadReceta[]).map(dif => (
                  <button
                    key={dif}
                    onClick={() => setLocal(prev => ({
                      ...prev,
                      dificultad: prev.dificultad === dif ? undefined : dif
                    }))}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      local.dificultad === dif
                        ? 'bg-salud-blue text-white shadow-sm'
                        : 'text-text-secondary hover:bg-salud-blue-soft/30 hover:text-salud-blue'
                    }`}
                  >
                    {getDificultadLabel(dif)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tiempo máximo */}
            <div>
              <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Tiempo Máximo (minutos)</p>
              <div className="flex gap-2">
                {[10, 15, 20, 30].map(min => (
                  <button
                    key={min}
                    onClick={() => setLocal(prev => ({
                      ...prev,
                      tiempoMaxMin: prev.tiempoMaxMin === min ? undefined : min
                    }))}
                    className={`flex-1 py-1.5 rounded-[var(--radius-md)] font-bold text-xs transition-all cursor-pointer border ${
                      local.tiempoMaxMin === min
                        ? 'bg-salud-blue text-white border-salud-blue shadow-sm'
                        : 'bg-white text-text-secondary border-border hover:border-salud-blue/30'
                    }`}
                  >
                    ≤{min}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* GRUPO 3: NUTRICIONAL & TAGS */}
        <div className="bg-bg-elevated p-4 rounded-xl border border-border/60">
          <h3 className="text-sm font-extrabold text-salud-green flex items-center gap-2 mb-4">
            <Flame size={18} /> Perfil Nutricional
          </h3>
          <div className="space-y-5">
            {/* Rango Calórico */}
            <div>
              <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">Calorías (Kcal por porción)</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Mínimo"
                  value={local.rangoKcal?.min || ''}
                  onChange={(e) => setLocal(prev => ({
                    ...prev,
                    rangoKcal: { min: Number(e.target.value) || 0, max: prev.rangoKcal?.max || 1000 }
                  }))}
                  className="bg-white"
                />
                <span className="text-text-tertiary text-sm font-bold">—</span>
                <Input
                  type="number"
                  placeholder="Máximo"
                  value={local.rangoKcal?.max || ''}
                  onChange={(e) => setLocal(prev => ({
                    ...prev,
                    rangoKcal: { min: prev.rangoKcal?.min || 0, max: Number(e.target.value) || 1000 }
                  }))}
                  className="bg-white"
                />
              </div>
            </div>

            {/* Carga Glicémica */}
            <div>
              <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={14} className="text-salud-green" /> Carga Glicémica
              </p>
              <div className="flex gap-2">
                {(['baja', 'media', 'alta'] as const).map(cg => (
                  <button
                    key={cg}
                    onClick={() => setLocal(prev => ({
                      ...prev,
                      cargaGlicemica: prev.cargaGlicemica === cg ? undefined : cg
                    }))}
                    className={`flex-1 py-1.5 rounded-[var(--radius-md)] font-bold text-xs transition-all cursor-pointer border uppercase tracking-wider ${
                      local.cargaGlicemica === cg
                        ? 'bg-salud-green text-white border-salud-green shadow-sm'
                        : 'bg-white text-text-secondary border-border hover:border-salud-green/30'
                    }`}
                  >
                    {cg}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={14} className="text-salud-amber" /> Otras Etiquetas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TAGS_DISPONIBLES.map(tag => {
                  const isActive = (local.tags || []).includes(tag.value);
                  return (
                    <button
                      key={tag.value}
                      onClick={() => {
                        const current = local.tags || [];
                        setLocal(prev => ({
                          ...prev,
                          tags: isActive
                            ? current.filter(t => t !== tag.value)
                            : [...current, tag.value]
                        }));
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-text-primary text-white border-text-primary shadow-sm'
                          : 'bg-white text-text-secondary border-border hover:border-text-primary/30'
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="flex gap-3 pt-4 border-t border-border/50 mt-4">
        <Button variant="secondary" onClick={handleClear} fullWidth>
          Limpiar Todo
        </Button>
        <Button variant="primary" onClick={handleApply} fullWidth>
          Ver Resultados
        </Button>
      </div>
    </Modal>
  );
}
