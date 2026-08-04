import { usePatient } from '../App';
import EmptyPatientState from '../components/patient/EmptyPatientState';
import Card from '../components/ui/Card';
import { TrendingUp, Scale, Droplets, CheckCircle, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Progreso() {
  const { state } = usePatient();
  const { evaluacion, resultados } = state;

  if (!evaluacion || !resultados) {
    return <EmptyPatientState />;
  }

  const historial = state.historialConsultas || [];
  const pesoData = historial.length > 0
    ? historial.map((h, i) => ({
        semana: `Eval ${i + 1}`,
        peso: h.pesoKg
      }))
    : [{ semana: 'Actual', peso: evaluacion.pesoKg }];

  const pesoInicial = pesoData[0].peso;
  const pesoActual = pesoData[pesoData.length - 1].peso;
  const diferencia = pesoData.length > 1 ? pesoActual - pesoInicial : 0;

  // Generar datos de los últimos 7 días desde el diario histórico
  const historyData = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = format(d, 'EEE', { locale: es });
    
    const log = state.diario?.[dateStr];
    const agua = log?.hidratacionMl || 0;
    const comidas = log?.comidasRegistradas ? Object.keys(log.comidasRegistradas).length : 0;
    
    return {
      fecha: dateStr,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      agua,
      comidas
    };
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2">
          <TrendingUp size={24} className="text-salud-blue" />
          Tu Progreso
        </h1>
        <p className="text-text-secondary mt-1">Seguimiento semanal de peso</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3 w-full">
        <Card padding="sm" className="text-center">
          <p className="text-xs text-text-secondary mb-1">Inicio</p>
          <p className="text-lg font-extrabold text-text-primary">{pesoInicial}</p>
          <p className="text-xs text-text-tertiary">kg</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-xs text-text-secondary mb-1">Actual</p>
          <p className="text-lg font-extrabold text-salud-blue">{pesoActual}</p>
          <p className="text-xs text-text-tertiary">kg</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-xs text-text-secondary mb-1">Cambio</p>
          <p className={`text-lg font-extrabold ${diferencia < 0 ? 'text-salud-green' : 'text-salud-red'}`}>
            {diferencia > 0 ? '+' : ''}{diferencia.toFixed(1)}
          </p>
          <p className="text-xs text-text-tertiary">kg</p>
        </Card>
      </div>

      {/* Weight chart */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Scale size={18} className="text-salud-blue" />
          <h2 className="font-bold text-text-primary">Evolución de Peso</h2>
        </div>
        <div className="h-[250px] -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pesoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="semana"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
              />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
                formatter={(value) => [`${value} kg`, 'Peso']}
              />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#2563EB', stroke: '#DBEAFE', strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Info note */}
      <Card className="delay-3 bg-bg-elevated/50 border-border/40">
        <div className="flex gap-3">
          <Info size={20} className="text-text-tertiary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary leading-relaxed">
            Esta gráfica de peso es de solo lectura. Tu progreso corporal y medidas son 
            registrados <strong>exclusivamente por tu médico o nutriólogo</strong> durante 
            tus consultas y chequeos oficiales en la clínica.
          </p>
        </div>
      </Card>

      {/* Gráfico de Hidratación */}
      <Card padding="lg" className="delay-2">
        <div className="flex items-center gap-2 mb-4">
          <Droplets size={18} className="text-salud-blue" />
          <h2 className="font-bold text-text-primary">Consumo de Agua (7 Días)</h2>
        </div>
        <div className="h-[200px] -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip 
                cursor={{ fill: '#DBEAFE', opacity: 0.4 }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                formatter={(value) => [`${value} ml`, 'Agua']}
              />
              <Bar dataKey="agua" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Gráfico de Adherencia (Comidas) */}
      <Card padding="lg" className="delay-3">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={18} className="text-salud-green" />
          <h2 className="font-bold text-text-primary">Comidas Completadas (7 Días)</h2>
        </div>
        <div className="h-[200px] -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="colorComidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                formatter={(value) => [`${value} comidas`, 'Completadas']}
              />
              <Area type="monotone" dataKey="comidas" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorComidas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
