import { usePatient } from '../App';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { HeartPulse, LogOut, Info, FileText, Pill, Activity, TrendingDown, UserCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

function WeightChart({ data }: { data: any[] }) {
  if (!data || data.length < 2) return null;
  
  // Filtrar los que tienen pesoKg
  const validData = data.filter(d => d.pesoKg);
  if (validData.length < 2) return null;

  const minWeight = Math.min(...validData.map(d => d.pesoKg)) - 2;
  const maxWeight = Math.max(...validData.map(d => d.pesoKg)) + 2;
  
  const points = validData.map((d, i) => {
    const x = (i / (validData.length - 1)) * 100;
    const y = 100 - ((d.pesoKg - minWeight) / (maxWeight - minWeight)) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-bg-elevated p-4 rounded-[var(--radius-md)] mb-4 border border-border/40">
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs font-bold text-salud-blue uppercase tracking-wider flex items-center gap-1">
          <TrendingDown size={14} /> Progreso de Peso
        </p>
        <div className="text-right">
          <p className="text-sm font-bold text-text-primary">{validData[validData.length - 1].pesoKg} kg</p>
          <p className="text-[10px] text-text-secondary">Actual</p>
        </div>
      </div>
      
      <div className="relative w-full h-24 mb-1">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {/* Grid lines */}
          <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" className="text-border" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-border" strokeDasharray="2,2" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-border" />
          
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-salud-blue drop-shadow-sm"
          />
          {validData.map((d, i) => {
            const x = (i / (validData.length - 1)) * 100;
            const y = 100 - ((d.pesoKg - minWeight) / (maxWeight - minWeight)) * 100;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="3" fill="white" stroke="currentColor" strokeWidth="1.5" className="text-salud-blue" />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between text-[10px] font-bold text-text-tertiary">
        <span>{new Date(validData[0].fecha).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        <span>{new Date(validData[validData.length - 1].fecha).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  );
}

export default function Perfil() {
  const { state: authState, dispatch: authDispatch } = useAuth();
  const { state: patientState, dispatch: patientDispatch } = usePatient();
  const { evaluacion } = patientState;

  const handleLogout = async () => {
    patientDispatch({ type: 'RESET' });
    authDispatch({ type: 'LOGOUT' });
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2">
          <UserCircle size={24} className="text-salud-purple" />
          Mi Perfil
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Gestiona tu información y preferencias
        </p>
      </div>

      <Card padding="lg" className="text-center relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-salud-blue to-salud-green mx-auto mb-4 flex items-center justify-center shadow-lg shadow-salud-blue/20">
          <HeartPulse size={32} className="text-white" />
        </div>
        <p className="text-lg font-bold text-text-primary">{authState.user?.email || 'Desconocido'}</p>
        <p className="text-sm text-text-secondary mt-1">
          {evaluacion ? evaluacion.nombre : 'Sesión de invitado'}
        </p>
      </Card>

      {/* Notice about institutional management */}
      <div className="bg-bg-elevated border border-border/40 p-3 rounded-[var(--radius-md)] flex items-start gap-3">
        <Info size={18} className="text-salud-green mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-text-primary">Tus datos médicos</p>
          <p className="text-xs text-text-secondary mt-0.5">La información clínica que ves a continuación es gestionada y actualizada exclusivamente por tu equipo médico en sus evaluaciones presenciales o virtuales.</p>
        </div>
      </div>

      {evaluacion && (
        <Card className="space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border/50 pb-2 mb-4">
            Datos Clínicos y Metabólicos
          </h2>

          {/* MODO LECTURA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-tertiary font-medium">Peso Actual</p>
              <p className="text-sm font-bold text-text-primary">{evaluacion.pesoKg} kg</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary font-medium">Estatura</p>
              <p className="text-sm font-bold text-text-primary">{evaluacion.tallaCm} cm</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary font-medium">Actividad Física</p>
              <p className="text-sm font-bold text-text-primary">Nivel {evaluacion.nivelActividad}</p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary font-medium">Objetivo</p>
              <p className="text-sm font-bold text-text-primary capitalize">{evaluacion.objetivo.replace('_', ' ')}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-text-tertiary font-medium">Condiciones</p>
              <p className="text-sm font-bold text-text-primary">{evaluacion.condiciones.join(', ') || 'Ninguna'}</p>
            </div>
          </div>
          
          {/* Antropometría y Fármacos (Lectura) */}
          <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-tertiary font-medium">Cintura / Cadera</p>
              <p className="text-sm font-bold text-text-primary">
                {evaluacion.circunferenciaCinturaCm || '--'} cm / {evaluacion.circunferenciaCaderaCm || '--'} cm
              </p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary font-medium">Glucosa / PA / Insulina</p>
              <p className="text-sm font-bold text-text-primary">
                {evaluacion.laboratorios?.glucosa ? `${evaluacion.laboratorios.glucosa} mg/dL` : '--'} / {evaluacion.laboratorios?.presionArterial || '--'}
                {evaluacion.laboratorios?.insulina ? ` / ${evaluacion.laboratorios.insulina} µU/mL` : ''}
              </p>
            </div>
            {evaluacion.laboratorios?.homaIr && (
              <div className="col-span-2 bg-salud-red-soft/40 border border-salud-red/20 p-2.5 rounded-lg flex items-center justify-between">
                <span className="text-xs font-bold text-salud-red flex items-center gap-1.5">🩺 Resistencia a la Insulina (HOMA-IR)</span>
                <span className="text-sm font-extrabold text-salud-red">{evaluacion.laboratorios.homaIr}</span>
              </div>
            )}
            {evaluacion.composicionCorporal && (
              <div className="col-span-2 bg-bg-elevated p-3 rounded-lg space-y-2 border border-border/40">
                <p className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <span>⚡</span> Composición Corporal / Bioimpedancia
                </p>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-text-secondary block">Grasa Corp.</span>
                    <strong className="text-text-primary">{evaluacion.composicionCorporal.porcentajeGrasa ? `${evaluacion.composicionCorporal.porcentajeGrasa}%` : '--'}</strong>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Grasa Visc.</span>
                    <strong className="text-salud-amber">{evaluacion.composicionCorporal.grasaVisceral ? `Nivel ${evaluacion.composicionCorporal.grasaVisceral}` : '--'}</strong>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Músculo (%)</span>
                    <strong className="text-salud-green">{evaluacion.composicionCorporal.musculoEsqueletico ? `${evaluacion.composicionCorporal.musculoEsqueletico}%` : '--'}</strong>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Músculo (kg)</span>
                    <strong className="text-text-primary">{evaluacion.composicionCorporal.musculoEsqueleticoKg ? `${evaluacion.composicionCorporal.musculoEsqueleticoKg} kg` : '--'}</strong>
                  </div>
                </div>
              </div>
            )}
            <div className="col-span-2">
              <p className="text-xs text-text-tertiary font-medium">Fármacos Actuales</p>
              <p className="text-sm font-bold text-text-primary">{evaluacion.medicamentosActuales || 'Ninguno registrado'}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Resultados de GET en Perfil */}
      {patientState.resultados && (
        <Card className="bg-bg-elevated border-border/40">
          <h2 className="text-sm font-bold text-salud-blue mb-2">Tu Gasto Energético Actual</h2>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Meta Diaria (GET):</span>
            <span className="text-lg font-extrabold text-text-primary">
              {Math.round(patientState.resultados.get)} Kcal
            </span>
          </div>
        </Card>
      )}

      {/* Historial de Consultas */}
      {patientState.historialConsultas && patientState.historialConsultas.length > 0 && (
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2 mb-4">
            <Activity size={18} className="text-salud-blue" />
            <h2 className="text-base font-bold text-text-primary">Mi Historial Clínico</h2>
          </div>
          
          <WeightChart data={patientState.historialConsultas} />
          
          <div className="space-y-4">
            {patientState.historialConsultas.slice().reverse().map((consulta: any, idx: number) => (
              <div key={consulta.id || idx} className="bg-bg-elevated p-4 rounded-[var(--radius-md)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-salud-blue" />
                    <span className="text-sm font-bold text-text-primary">
                      {idx === patientState.historialConsultas.length - 1 ? 'Evaluación Inicial' : `Consulta #${patientState.historialConsultas.length - idx}`}
                    </span>
                  </div>
                  <span className="text-xs text-text-tertiary">
                    {new Date(consulta.fecha).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm border-y border-border/40 py-2">
                  <div>
                    <span className="text-text-tertiary block text-xs">Peso</span>
                    <span className="font-bold">{consulta.pesoKg} kg</span>
                  </div>
                  {consulta.resultados && (
                    <div>
                      <span className="text-text-tertiary block text-xs">IMC</span>
                      <span className="font-bold text-salud-blue">{consulta.resultados.imc.toFixed(1)}</span>
                    </div>
                  )}
                  {consulta.composicionCorporal?.porcentajeGrasa && (
                    <div>
                      <span className="text-text-tertiary block text-xs">% Grasa</span>
                      <span className="font-bold text-salud-amber">{consulta.composicionCorporal.porcentajeGrasa}%</span>
                    </div>
                  )}
                  {consulta.composicionCorporal?.musculoEsqueletico && (
                    <div>
                      <span className="text-text-tertiary block text-xs">% Músculo</span>
                      <span className="font-bold text-salud-green">{consulta.composicionCorporal.musculoEsqueletico}%</span>
                    </div>
                  )}
                  {consulta.laboratorios?.homaIr && (
                    <div>
                      <span className="text-text-tertiary block text-xs">HOMA-IR</span>
                      <span className="font-bold text-salud-red">{consulta.laboratorios.homaIr}</span>
                    </div>
                  )}
                </div>

                {/* Indicaciones Médicas */}
                {consulta.indicacionesPaciente && (
                  <div className="bg-bg-elevated border border-border/40 p-3 rounded-[var(--radius-md)]">
                    <p className="text-xs font-bold text-salud-green mb-1">Recomendaciones de tu médico:</p>
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{consulta.indicacionesPaciente}</p>
                  </div>
                )}
                
                {/* Check if prescriptions were given during this evaluation (mock indicator) */}
                {consulta.indicacionesPaciente && consulta.indicacionesPaciente.toLowerCase().includes('receta') && (
                  <div className="flex items-center gap-1.5 mt-2 text-salud-purple text-xs font-bold">
                    <Pill size={14} /> Tienes una nueva receta médica
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Button
        variant="danger"
        fullWidth
        onClick={handleLogout}
        icon={<LogOut size={18} />}
      >
        Cerrar sesión
      </Button>
    </div>
  );
}
