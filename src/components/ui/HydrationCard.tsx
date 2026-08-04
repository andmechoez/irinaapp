import { Droplets, Plus, Undo2 } from 'lucide-react';

interface HydrationCardProps {
  consumidoMl: number;
  metaMl: number;
  onAddWater: () => void;
  onRemoveWater?: () => void;
  porcionMl?: number;
}

export default function HydrationCard({
  consumidoMl,
  metaMl,
  onAddWater,
  onRemoveWater,
  porcionMl = 250,
}: HydrationCardProps) {
  const porcentaje = Math.min(Math.round((consumidoMl / metaMl) * 100), 100);
  const vasos = Math.round(consumidoMl / porcionMl);
  const vasosTotal = Math.ceil(metaMl / porcionMl);
  const isComplete = consumidoMl >= metaMl;

  return (
    <div className="bg-bg-card rounded-[var(--radius-xl)] border border-border/40 shadow-[var(--shadow-card)] p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Droplets size={22} className="text-salud-blue" />
        <h3 className="text-lg font-bold text-text-primary">Hidratación</h3>
      </div>

      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-text-secondary mb-1">Consumido</p>
            <p className="text-3xl font-bold text-text-primary">
              {consumidoMl} <span className="text-sm font-normal text-text-tertiary">/ {metaMl} ml</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-salud-blue">{porcentaje}%</p>
            <p className="text-xs text-text-tertiary">{vasos} de {vasosTotal} vasos</p>
          </div>
        </div>

        {/* Flat Progress Bar */}
        <div className="h-4 w-full bg-bg-elevated rounded-full overflow-hidden border border-border/40">
          <div 
            className={`h-full transition-all duration-700 ease-out ${isComplete ? 'bg-salud-green' : 'bg-salud-blue'}`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>

        {/* Info + Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            {/* Add water button */}
            <button
              onClick={onAddWater}
              disabled={isComplete}
              className={`
                h-10 px-4 rounded-[var(--radius-md)] flex items-center gap-2
                text-white font-bold text-sm
                shadow-sm transition-all duration-200
                active:scale-95
                ${isComplete
                  ? 'bg-salud-green cursor-default'
                  : 'bg-salud-blue hover:bg-salud-blue-light hover:shadow cursor-pointer'
                }
              `}
            >
              {isComplete ? (
                <><Droplets size={16} /> Completado</>
              ) : (
                <><Plus size={16} strokeWidth={3} /> Agregar {porcionMl}ml</>
              )}
            </button>
            {onRemoveWater && consumidoMl > 0 && (
              <button
                onClick={onRemoveWater}
                className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center bg-bg-elevated text-text-tertiary hover:text-text-primary hover:bg-salud-blue-soft/50 transition-colors border border-border/40 cursor-pointer active:scale-95 shadow-sm"
                aria-label={`Deshacer ${porcionMl}ml de agua`}
              >
                <Undo2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
