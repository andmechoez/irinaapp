import type { MacroDetalle } from '../../types';
import { formatNumber } from '../../utils/formulas';

interface MacroChartProps {
  proteinas: MacroDetalle;
  grasas: MacroDetalle;
  carbohidratos: MacroDetalle;
  totalKcal: number;
}

const macroConfig = {
  proteinas: { label: 'Proteínas', color: 'bg-salud-blue', soft: 'bg-salud-blue-soft', text: 'text-salud-blue' },
  grasas: { label: 'Grasas', color: 'bg-salud-amber', soft: 'bg-salud-amber-soft', text: 'text-salud-amber' },
  carbohidratos: { label: 'Carbohidratos', color: 'bg-salud-green', soft: 'bg-salud-green-soft', text: 'text-salud-green' },
};

export default function MacroChart({
  proteinas,
  grasas,
  carbohidratos,
  totalKcal,
}: MacroChartProps) {
  const macros = [
    { key: 'proteinas' as const, data: proteinas },
    { key: 'grasas' as const, data: grasas },
    { key: 'carbohidratos' as const, data: carbohidratos },
  ];

  return (
    <div className="space-y-2">
      {/* Proportional bar */}
      <div className="flex rounded-full overflow-hidden h-2 shadow-inner">
        {macros.map(({ key, data }) => (
          <div
            key={key}
            className={`${macroConfig[key].color} transition-all duration-700`}
            style={{ width: `${data.porcentaje}%` }}
            title={`${macroConfig[key].label}: ${formatNumber(data.porcentaje)}%`}
          />
        ))}
      </div>

      {/* Legend & values */}
      <div className="grid grid-cols-3 gap-3">
        {macros.map(({ key, data }) => {
          const config = macroConfig[key];
          return (
            <div
              key={key}
              className="p-1 text-center"
            >
              <p className={`text-[10px] font-semibold ${config.text} mb-0.5`}>{config.label}</p>
              <p className="text-sm font-extrabold text-text-primary leading-tight">
                {formatNumber(data.gramos, 0)}g
              </p>
              <p className="text-[10px] text-text-secondary leading-tight">
                {formatNumber(data.porcentaje, 0)}% · {formatNumber(data.kcal, 0)} kcal
              </p>
              <p className="text-[9px] text-text-tertiary font-mono mt-0.5">
                ({data.kcalPorGramo || (key === 'grasas' ? 9 : 4)} kcal/g)
              </p>
            </div>
          );
        })}
      </div>

      {/* Total y Nota Calórica */}
      <div className="flex items-center justify-between text-[10px] text-text-secondary border-t border-border/40 pt-2 mt-2">
        <div>
          <span>Total: </span>
          <span className="font-bold text-text-primary">{formatNumber(totalKcal, 0)} kcal</span>
        </div>
        <div className="text-[9px] text-text-tertiary font-medium">
          ⚡ Densidad: 4 kcal/g (Prot/Carb) · 9 kcal/g (Grasas)
        </div>
      </div>
    </div>
  );
}
