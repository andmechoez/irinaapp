interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorMap: Record<string, { bg: string; fill: string }> = {
  blue: { bg: 'bg-salud-blue-soft', fill: 'bg-salud-blue' },
  green: { bg: 'bg-salud-green-soft', fill: 'bg-salud-green' },
  amber: { bg: 'bg-salud-amber-soft', fill: 'bg-salud-amber' },
  red: { bg: 'bg-salud-red-soft', fill: 'bg-salud-red' },
};

const sizeMap: Record<string, string> = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export default function ProgressBar({
  value,
  max,
  label,
  showPercentage = false,
  color = 'blue',
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const colors = colorMap[color];

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-medium text-text-secondary">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-bold text-text-primary">{percentage}%</span>
          )}
        </div>
      )}
      <div
        className={`w-full ${colors.bg} rounded-full overflow-hidden ${sizeMap[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progreso'}
      >
        <div
          className={`${colors.fill} ${sizeMap[size]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
