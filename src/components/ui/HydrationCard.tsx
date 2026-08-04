import { useState } from 'react';
import { Droplets, Plus, Undo2, History, RotateCcw, CheckCircle2, Calendar } from 'lucide-react';
import Modal from './Modal';
import type { DailyLog } from '../../types';

interface HydrationCardProps {
  consumidoMl: number;
  metaMl: number;
  onAddWater: () => void;
  onRemoveWater?: () => void;
  porcionMl?: number;
  diario?: Record<string, DailyLog>;
}

export default function HydrationCard({
  consumidoMl,
  metaMl,
  onAddWater,
  onRemoveWater,
  porcionMl = 250,
  diario = {},
}: HydrationCardProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const porcentaje = Math.min(Math.round((consumidoMl / metaMl) * 100), 100);
  const vasos = Math.floor(consumidoMl / porcionMl);
  const vasosTotal = Math.max(8, Math.ceil(metaMl / porcionMl));
  const isComplete = consumidoMl >= metaMl;

  // Format daily history entries from diario object
  const historyEntries = Object.keys(diario)
    .sort((a, b) => b.localeCompare(a)) // sort descending by date
    .map(fecha => {
      const log = diario[fecha];
      const aguaMl = log?.hidratacionMl || 0;
      const pct = Math.min(Math.round((aguaMl / metaMl) * 100), 100);
      const v = Math.round(aguaMl / porcionMl);
      
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

      let labelFecha = fecha;
      if (fecha === todayStr) labelFecha = 'Hoy';
      else if (fecha === yesterdayStr) labelFecha = 'Ayer';
      else {
        const [yyyy, mm, dd] = fecha.split('-');
        labelFecha = `${dd}/${mm}/${yyyy}`;
      }

      return {
        fecha,
        labelFecha,
        aguaMl,
        pct,
        vasos: v,
        cumplido: aguaMl >= metaMl,
      };
    });

  return (
    <div className="bg-bg-card rounded-[var(--radius-xl)] border border-border/40 shadow-[var(--shadow-card)] p-6 animate-slide-up space-y-6">
      
      {/* Header & Main Info */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-salud-blue-soft/60 flex items-center justify-center">
            <Droplets size={22} className="text-salud-blue" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Hidratación Diaria</h3>
            <p className="text-xs text-text-tertiary">1 vaso = {porcionMl} ml</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-salud-blue hover:bg-salud-blue-soft/50 rounded-lg transition-colors cursor-pointer border border-salud-blue/20"
        >
          <History size={14} />
          <span>Historial Diario</span>
        </button>
      </div>

      {/* Progress Stats */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Agua Consumida Hoy</p>
            <p className="text-3xl font-extrabold text-text-primary tracking-tight">
              {consumidoMl.toLocaleString()} <span className="text-sm font-normal text-text-tertiary">/ {metaMl.toLocaleString()} ml</span>
            </p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-black ${isComplete ? 'text-salud-green' : 'text-salud-blue'}`}>
              {porcentaje}%
            </p>
            <p className="text-xs font-medium text-text-tertiary">{vasos} de {vasosTotal} vasos</p>
          </div>
        </div>

        {/* Flat Progress Bar */}
        <div className="h-3.5 w-full bg-bg-elevated rounded-full overflow-hidden border border-border/30">
          <div 
            className={`h-full transition-all duration-700 ease-out ${isComplete ? 'bg-salud-green' : 'bg-salud-blue'}`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>



      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <div className="flex items-center gap-2">
          <button
            onClick={onAddWater}
            disabled={isComplete}
            className={`
              h-10 px-4 rounded-[var(--radius-md)] flex items-center gap-2
              text-white font-bold text-sm shadow-sm transition-all duration-200 active:scale-95
              ${isComplete
                ? 'bg-salud-green cursor-default'
                : 'bg-salud-blue hover:bg-salud-blue-light cursor-pointer'
              }
            `}
          >
            {isComplete ? (
              <><CheckCircle2 size={16} /> ¡Meta del día alcanzada!</>
            ) : (
              <><Plus size={16} strokeWidth={3} /> Agregar vaso ({porcionMl}ml)</>
            )}
          </button>

          {onRemoveWater && consumidoMl > 0 && (
            <button
              onClick={onRemoveWater}
              className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center bg-bg-elevated text-text-tertiary hover:text-text-primary hover:bg-salud-blue-soft/50 transition-colors border border-border/40 cursor-pointer active:scale-95 shadow-sm"
              title={`Quitar ${porcionMl}ml`}
            >
              <Undo2 size={16} />
            </button>
          )}
        </div>

        {/* Auto Reset Notice */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-text-tertiary bg-bg-elevated px-3 py-1.5 rounded-lg border border-border/40">
          <RotateCcw size={12} className="text-salud-blue" />
          <span>Reseteo automático cada día a las 00:00</span>
        </div>
      </div>

      {/* Modal de Historial Diario de Hidratación */}
      <Modal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        title="Historial Diario de Hidratación"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-secondary">
            Consulta el agua consumida en cada día registrado. Tus datos se guardan de forma permanente al finalizar la jornada.
          </p>

          {historyEntries.length === 0 ? (
            <div className="text-center p-8 text-text-tertiary bg-bg-elevated rounded-xl">
              <Droplets size={32} className="mx-auto mb-2 opacity-50 text-salud-blue" />
              <p className="text-sm font-medium">Aún no hay registros de agua en tu historial.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {historyEntries.map(entry => (
                <div 
                  key={entry.fecha} 
                  className="p-3.5 rounded-xl bg-bg-elevated border border-border/50 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${entry.cumplido ? 'bg-salud-green/10 text-salud-green' : 'bg-salud-blue/10 text-salud-blue'}`}>
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{entry.labelFecha}</p>
                      <p className="text-xs text-text-tertiary">{entry.aguaMl.toLocaleString()} ml • {entry.vasos} vasos</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-24 hidden sm:block">
                      <div className="h-2 w-full bg-border/40 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${entry.cumplido ? 'bg-salud-green' : 'bg-salud-blue'}`}
                          style={{ width: `${entry.pct}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      entry.cumplido ? 'bg-salud-green/10 text-salud-green border border-salud-green/20' : 'bg-salud-blue/10 text-salud-blue border border-salud-blue/20'
                    }`}>
                      {entry.cumplido ? 'Meta alcanzada' : `${entry.pct}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
}

