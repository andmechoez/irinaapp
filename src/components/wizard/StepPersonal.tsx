import { User, UserRound } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import type { Sexo, ComposicionCorporal } from '../../types';

interface StepPersonalProps {
  nombre: string;
  apellido?: string;
  cedula?: string;
  telefono?: string;
  fechaNacimiento?: string;
  tipoSangre?: string;
  edad: number;
  sexo: Sexo | '';
  pesoKg: number;
  tallaCm: number;
  circunferenciaCinturaCm: number;
  circunferenciaCaderaCm: number;
  composicionCorporal?: ComposicionCorporal;
  onUpdate: (field: string, value: any) => void;
}

export default function StepPersonal({
  nombre,
  apellido,
  cedula,
  telefono,
  fechaNacimiento,
  tipoSangre,
  sexo,
  pesoKg,
  tallaCm,
  circunferenciaCinturaCm,
  circunferenciaCaderaCm,
  composicionCorporal,
  onUpdate,
}: StepPersonalProps) {
  const [y = '', m = '', d = ''] = (fechaNacimiento || '').split('-');

  const handleComposicionChange = (field: string, val: number | '') => {
    onUpdate('composicionCorporal', {
      ...(composicionCorporal || {}),
      [field]: val === '' ? undefined : val,
    });
  };

  const handleDateChange = (part: 'year' | 'month' | 'day', value: string) => {
    const newY = part === 'year' ? value : y;
    const newM = part === 'month' ? value : m;
    const newD = part === 'day' ? value : d;
    
    // Evitar actualizar si se borra una parte y no queda formato YYYY-MM-DD,
    // pero guardamos el estado parcial si es necesario, o siempre emitimos.
    // Lo ideal es emitir el string completo.
    const newDate = [newY, newM, newD].join('-');
    onUpdate('fechaNacimiento', newDate);

    // Calcular edad si están completos
    if (newY && newM && newD && newY.length === 4) {
      const birthDate = new Date(`${newY}-${newM}-${newD}`);
      if (!isNaN(birthDate.getTime())) {
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        onUpdate('edad', Math.abs(ageDate.getUTCFullYear() - 1970));
      }
    }
  };

  const days = Array.from({length: 31}, (_, i) => String(i + 1).padStart(2, '0'));
  const months = Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 100}, (_, i) => String(currentYear - i));

  return (
    <div className="space-y-6 animate-slide-right">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">Datos Personales</h2>
        <p className="text-text-secondary">Información básica para tu evaluación nutricional</p>
      </div>

      {/* Nombres, Apellidos, Cédula y Teléfono */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-semibold text-text-primary mb-2">
            Nombres
          </label>
          <Input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => onUpdate('nombre', e.target.value)}
            placeholder="Tus nombres"
          />
        </div>
        <div>
          <label htmlFor="apellido" className="block text-sm font-semibold text-text-primary mb-2">
            Apellidos
          </label>
          <Input
            id="apellido"
            type="text"
            value={apellido || ''}
            onChange={(e) => onUpdate('apellido', e.target.value)}
            placeholder="Tus apellidos"
          />
        </div>
        <div>
          <label htmlFor="cedula" className="block text-sm font-semibold text-text-primary mb-2">
            Número de Cédula
          </label>
          <Input
            id="cedula"
            type="text"
            value={cedula || ''}
            onChange={(e) => onUpdate('cedula', e.target.value)}
            placeholder="Ej. 1700000000"
          />
        </div>
        <div>
          <label htmlFor="telefono" className="block text-sm font-semibold text-text-primary mb-2">
            Teléfono
          </label>
          <Input
            id="telefono"
            type="tel"
            value={telefono || ''}
            onChange={(e) => onUpdate('telefono', e.target.value)}
            placeholder="Ej. +52 55 1234 5678"
          />
        </div>
      </div>

      {/* Sexo - Tarjetas grandes con iconos */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-3">Sexo biológico</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'hombre', label: 'Hombre', icon: User },
            { value: 'mujer', label: 'Mujer', icon: UserRound },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onUpdate('sexo', value)}
              className={`
                flex flex-col items-center justify-center gap-2
                p-5 rounded-[var(--radius-lg)] border-2
                min-h-[100px] transition-all duration-200
                cursor-pointer
                ${sexo === value
                  ? 'border-salud-blue bg-salud-blue-soft text-salud-blue shadow-md'
                  : 'border-border bg-bg-card text-text-secondary hover:border-salud-blue/40'
                }
              `}
              aria-pressed={sexo === value}
            >
              <Icon size={36} strokeWidth={1.5} />
              <span className="font-semibold text-base">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fecha Nacimiento y Tipo Sangre */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Fecha de Nacimiento
          </label>
          <div className="flex gap-2">
            <Select
              value={d}
              onChange={(e) => handleDateChange('day', e.target.value)}
              className="text-center px-1"
            >
              <option value="">Día</option>
              {days.map(day => <option key={day} value={day}>{day}</option>)}
            </Select>
            <Select
              value={m}
              onChange={(e) => handleDateChange('month', e.target.value)}
              className="text-center px-1"
            >
              <option value="">Mes</option>
              {months.map(month => <option key={month} value={month}>{month}</option>)}
            </Select>
            <Select
              value={y}
              onChange={(e) => handleDateChange('year', e.target.value)}
              className="text-center px-1"
            >
              <option value="">Año</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </Select>
          </div>
        </div>

        <div>
          <label htmlFor="tipoSangre" className="block text-sm font-semibold text-text-primary mb-2">
            Tipo de Sangre
          </label>
          <Select
            id="tipoSangre"
            value={tipoSangre || ''}
            onChange={(e) => onUpdate('tipoSangre', e.target.value)}
          >
            <option value="">Selecciona...</option>
            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Peso, Talla en grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">

        <div className="flex flex-col justify-end">
          <label htmlFor="peso" className="block text-sm font-semibold text-text-primary mb-2">
            Peso
          </label>
            <Input
              id="peso"
              type="number"
              value={pesoKg || ''}
              onChange={(e) => onUpdate('pesoKg', Number(e.target.value))}
              placeholder="0"
              min={30}
              max={300}
              step={0.1}
              className="text-center"
              rightElement="kg"
            />
        </div>

        <div className="flex flex-col justify-end">
          <label htmlFor="talla" className="block text-sm font-semibold text-text-primary mb-2">
            Talla
          </label>
            <Input
              id="talla"
              type="number"
              value={tallaCm || ''}
              onChange={(e) => onUpdate('tallaCm', Number(e.target.value))}
              placeholder="0"
              min={100}
              max={250}
              className="text-center"
              rightElement="cm"
            />
        </div>

        <div className="flex flex-col justify-end">
          <label htmlFor="cintura" className="block text-sm font-semibold text-text-primary mb-2">
            Cintura
          </label>
            <Input
              id="cintura"
              type="number"
              value={circunferenciaCinturaCm || ''}
              onChange={(e) => onUpdate('cinturaCm', Number(e.target.value))}
              placeholder="0"
              min={40}
              max={200}
              className="text-center"
              rightElement="cm"
            />
        </div>

        <div className="flex flex-col justify-end">
          <label htmlFor="cadera" className="block text-sm font-semibold text-text-primary mb-2">
            Cadera
          </label>
            <Input
              id="cadera"
              type="number"
              value={circunferenciaCaderaCm || ''}
              onChange={(e) => onUpdate('caderaCm', Number(e.target.value))}
              placeholder="0"
              min={40}
              max={200}
              className="text-center"
              rightElement="cm"
            />
        </div>
      </div>

      {/* Composición Corporal (Bioimpedancia) */}
      <div className="bg-bg-elevated/40 border border-border/60 p-4 rounded-[var(--radius-lg)] space-y-4 mt-6">
        <div>
          <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
            <span>⚡</span> Composición Corporal / Bioimpedancia (Opcional)
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Si cuentas con medición de báscula de impedancia (InBody, Tanita, etc.), ingresa los porcentajes.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Grasa Corporal
            </label>
            <Input
              type="number"
              step="0.1"
              placeholder="Ej: 24.5"
              value={composicionCorporal?.porcentajeGrasa || ''}
              onChange={(e) => handleComposicionChange('porcentajeGrasa', e.target.value ? Number(e.target.value) : '')}
              rightElement="%"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Grasa Visceral (1-20)
            </label>
            <Input
              type="number"
              placeholder="Ej: 8"
              min={1}
              max={20}
              value={composicionCorporal?.grasaVisceral || ''}
              onChange={(e) => handleComposicionChange('grasaVisceral', e.target.value ? Number(e.target.value) : '')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Músculo Esquelético
            </label>
            <Input
              type="number"
              step="0.1"
              placeholder="Ej: 32.0"
              value={composicionCorporal?.musculoEsqueletico || ''}
              onChange={(e) => handleComposicionChange('musculoEsqueletico', e.target.value ? Number(e.target.value) : '')}
              rightElement="%"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Músculo (kg)
            </label>
            <Input
              type="number"
              step="0.1"
              placeholder="Ej: 28.5"
              value={composicionCorporal?.musculoEsqueleticoKg || ''}
              onChange={(e) => handleComposicionChange('musculoEsqueleticoKg', e.target.value ? Number(e.target.value) : '')}
              rightElement="kg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
