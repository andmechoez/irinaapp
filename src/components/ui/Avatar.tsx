import type { UserRole } from '../../types/auth';

// =============================================
// Avatar — Iniciales de usuario con color
// =============================================

interface AvatarProps {
  nombre: string;
  apellido?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  role?: UserRole;
  className?: string;
  imageUrl?: string;
}

const sizeMap: Record<string, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-gradient-to-br from-violet-500 to-purple-600',
  especialista: 'bg-gradient-to-br from-salud-blue to-salud-green',
  staff: 'bg-gradient-to-br from-slate-500 to-gray-600',
  asistente: 'bg-gradient-to-br from-amber-500 to-orange-600',
  paciente: 'bg-gradient-to-br from-salud-blue to-salud-green',
};

function getInitials(nombre: string, apellido?: string): string {
  const first = nombre.charAt(0).toUpperCase();
  const last = apellido ? apellido.charAt(0).toUpperCase() : nombre.split(' ')[1]?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}`;
}

export default function Avatar({ nombre, apellido, size = 'md', role = 'paciente', className = '', imageUrl }: AvatarProps) {
  const initials = getInitials(nombre, apellido);

  if (imageUrl) {
    return (
      <div className={`${sizeMap[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
        <img src={imageUrl} alt={nombre} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`
        ${sizeMap[size]} ${roleColors[role]}
        rounded-full flex items-center justify-center
        text-white font-bold flex-shrink-0
        shadow-md ${className}
      `}
      title={`${nombre}${apellido ? ` ${apellido}` : ''}`}
    >
      {initials}
    </div>
  );
}
