import type { ReactNode } from 'react';

// =============================================
// StatCard — Tarjeta de estadística para dashboards
// =============================================

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  className?: string;
}

const colorMap: Record<string, { bg: string; iconBg: string; text: string }> = {
  blue: { bg: 'bg-salud-blue-soft/30', iconBg: 'bg-salud-blue-soft', text: 'text-salud-blue' },
  green: { bg: 'bg-salud-green-soft/30', iconBg: 'bg-salud-green-soft', text: 'text-salud-green' },
  amber: { bg: 'bg-salud-amber-soft/30', iconBg: 'bg-salud-amber-soft', text: 'text-salud-amber' },
  red: { bg: 'bg-salud-red-soft/30', iconBg: 'bg-salud-red-soft', text: 'text-salud-red' },
  purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', text: 'text-purple-600' },
};

export default function StatCard({ label, value, subtitle, icon, trend, color = 'blue', className = '' }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className={`
      bg-bg-card rounded-[var(--radius-lg)] border border-border/40
      shadow-[var(--shadow-card)] p-3.5 md:p-4
      transition-all duration-300 hover:shadow-[var(--shadow-card-hover)]
      ${className}
    `}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        {icon && (
          <div className={`w-10 h-10 rounded-[var(--radius-md)] ${colors.iconBg} flex items-center justify-center ${colors.text}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-extrabold text-text-primary tracking-tight">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {trend && (
          <span className={`text-xs font-bold ${trend.value >= 0 ? 'text-salud-green' : 'text-salud-red'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
        {subtitle && <p className="text-xs text-text-tertiary">{subtitle}</p>}
      </div>
    </div>
  );
}
