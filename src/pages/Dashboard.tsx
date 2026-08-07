import { useState, useEffect } from 'react';
import { usePatient } from '../App';
import { PORCION_AGUA_ML } from '../utils/constants';
import MetricCard from '../components/dashboard/MetricCard';
import HydrationCard from '../components/ui/HydrationCard';
import AlertBanner from '../components/ui/AlertBanner';
import Card from '../components/ui/Card';
import EmptyPatientState from '../components/patient/EmptyPatientState';
import CheckInModal from '../components/patient/CheckInModal';
import NutritionGuidesModal from '../components/patient/NutritionGuidesModal';
import PatientInfografiasModal from '../components/patient/PatientInfografiasModal';
import { Check, PlayCircle, Pill, Trophy, BookOpen, Info, Activity, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ClinicalContent } from '../types';

export default function Dashboard() {
  const { state, dispatch } = usePatient();
  const { evaluacion, resultados } = state;

  const [selectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [showGuiasModal, setShowGuiasModal] = useState(false);
  const [showInfografiasModal, setShowInfografiasModal] = useState(false);

  // Reto Semanal: contenido global de clinical_content
  const [reto, setReto] = useState<ClinicalContent | null>(null);

  useEffect(() => {
    async function fetchDynamicContent() {
      if (!evaluacion) return;

      const { data, error } = await supabase
        .from('clinical_content')
        .select('*')
        .eq('is_active', true);

      if (!error && data) {
        const validRetos = data.filter(c =>
          c.type === 'reto' &&
          (!c.trigger_condition || evaluacion.condiciones.includes(c.trigger_condition)) &&
          (!c.trigger_objective || c.trigger_objective === evaluacion.objetivo)
        );
        if (validRetos.length > 0) {
          setReto(validRetos[Math.floor(Math.random() * validRetos.length)]);
        }
      }
    }
    fetchDynamicContent();
  }, [evaluacion]);

  // Rutina de rehabilitación: asignada individualmente por el equipo médico
  const rutinaVideoUrl = state.rutinaVideoUrl;
  const rutinaItems = state.rutinaItems;
  const hasRutina = !!(rutinaVideoUrl || (rutinaItems && rutinaItems.length > 0));

  if (!evaluacion || !resultados) {
    return <EmptyPatientState />;
  }

  const todayLog = state.diario?.[selectedDate];
  const hidratacionActual = todayLog?.hidratacionMl || 0;
  const prescripciones = state.prescripciones || [];
  const adherencia = todayLog?.adherenciaPrescripciones || [];

  const hasCheckInToday = !!todayLog?.habitos?.completado || Object.keys(todayLog?.habitos || {}).length > 0;

  /**
   * Registra la toma de una prescripción médica.
   * Marca el medicamento como tomado en la fecha actual y lo añade al historial de adherencia.
   */
  const handlePrescriptionTake = (prescripcionId: string) => {
    const isTaken = adherencia.some(a => a.prescripcionId === prescripcionId && a.tomada);
    if (isTaken) return;

    const newAdherence = [...adherencia, { prescripcionId, horaToma: new Date().toISOString(), tomada: true }];
    dispatch({
      type: 'LOG_HABITS',
      payload: {
        fecha: selectedDate,
        adherenciaPrescripciones: newAdherence // We need to update the reducer to support this
      }
    });
  };

  /**
   * Suma una porción estándar de agua al total diario consumido.
   * Modifica el estado global del paciente y lo persiste.
   */
  const handleAddWater = () => {
    dispatch({ type: 'LOG_WATER', payload: { fecha: selectedDate, amount: PORCION_AGUA_ML } });
  };

  const handleRemoveWater = () => {
    dispatch({ type: 'LOG_WATER', payload: { fecha: selectedDate, amount: -PORCION_AGUA_ML } });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Saludo y Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Hola, {evaluacion.nombre}
          </h1>
          <p className="text-text-secondary text-sm">Tu resumen de hoy</p>
        </div>
      </div>

      {/* Información del Tratamiento Institucional */}
      <div className="bg-salud-blue-soft/20 border border-salud-blue/20 p-3 rounded-[var(--radius-md)] flex items-start gap-3 animate-slide-up [animation-delay:100ms]">
        <Info size={18} className="text-salud-blue mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-text-primary">Tu plan nutricional ha sido actualizado</p>
          <p className="text-xs text-text-secondary mt-0.5">Este plan y tus metas son gestionados directamente por tu equipo médico en AVIVA.</p>
        </div>
      </div>

      {/* Alerta Clínica Condicional */}
      {resultados.alertaHidratacion && (
        <AlertBanner
          message="⚠️ Recuerda tu restricción de sodio debido a la Hipertensión."
          detail="Mantén un control estricto de tus líquidos y evita añadir sal a las comidas."
          variant="warning"
        />
      )}

      {/* Tarjetas de Resumen (Métricas) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard type="imc" resultados={resultados} />
        <MetricCard type="get" resultados={resultados} />
        <div className="hidden lg:block">
          <Card className="h-full flex flex-col justify-center text-center">
            <p className="text-xs text-text-secondary mb-1">Adherencia Semanal</p>
            <p className="text-2xl font-extrabold text-salud-green">92%</p>
          </Card>
        </div>
      </div>

      {/* Hidratación Interactiva vinculada al Historial */}
      <HydrationCard
        consumidoMl={hidratacionActual}
        metaMl={resultados.metaHidratacionMl}
        onAddWater={handleAddWater}
        onRemoveWater={handleRemoveWater}
        porcionMl={PORCION_AGUA_ML}
        diario={state.diario}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tracker de Medicación, Dolor y Sueño */}
        <Card padding="lg" className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-salud-purple-soft flex items-center justify-center">
              <Pill size={22} className="text-salud-purple" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Hábitos y Salud</h2>
          </div>

          {/* Medicación (Prescripciones Dinámicas) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs font-semibold text-text-secondary">Mis Prescripciones</p>
            </div>
            {prescripciones.length > 0 ? (
              prescripciones.filter(p => p.activa).map(p => {
                const isTaken = adherencia.some(a => a.prescripcionId === p.id && a.tomada);
                return (
                  <button
                    key={p.id}
                    disabled={isTaken}
                    onClick={() => handlePrescriptionTake(p.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-[var(--radius-md)] border transition-all duration-200 ${isTaken
                        ? 'border-salud-green bg-salud-green-soft opacity-80 cursor-default'
                        : 'border-border bg-bg-card cursor-pointer hover:border-salud-green/40'
                      }`}
                  >
                    <div className="text-left">
                      <span className={`block font-medium text-sm ${isTaken ? 'text-salud-green font-bold' : 'text-text-primary'}`}>
                        💊 {p.medicamento}
                      </span>
                      <span className="text-xs text-text-tertiary">{p.dosis} • {p.frecuencia}</span>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isTaken ? 'bg-salud-green border-salud-green' : 'border-text-tertiary'
                      }`}>
                      {isTaken && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 rounded-[var(--radius-md)] border-2 border-border bg-bg-elevated/50 text-center">
                <p className="text-xs text-text-tertiary">No tienes prescripciones activas</p>
              </div>
            )}
          </div>

          {/* Check-in Diario Consolidado */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            {hasCheckInToday ? (
              <div className="bg-salud-green/5 p-4 rounded-[var(--radius-md)] border border-salud-green/30 text-center space-y-3">
                <div className="w-12 h-12 bg-salud-green/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} className="text-salud-green" />
                </div>
                <div>
                  <p className="font-bold text-text-primary text-sm">Check-in de hoy completado</p>
                  <p className="text-xs text-text-secondary mt-1">¡Excelente trabajo! Registraste tus hábitos del día. Tu próximo check-in estará disponible mañana.</p>
                </div>
                <button
                  onClick={() => setIsCheckInOpen(true)}
                  className="w-full py-2 bg-salud-green/10 text-salud-green border border-salud-green/30 rounded-[var(--radius-md)] font-bold text-xs hover:bg-salud-green/20 transition-colors cursor-pointer"
                >
                  Ver / Editar respuestas o Historial
                </button>
              </div>
            ) : (
              <div className="bg-salud-blue-soft/30 p-4 rounded-[var(--radius-md)] border border-salud-blue/20 text-center space-y-3">
                <div className="w-12 h-12 bg-salud-blue-soft rounded-full flex items-center justify-center mx-auto">
                  <Activity size={24} className="text-salud-blue" />
                </div>
                <div>
                  <p className="font-bold text-text-primary text-sm">Check-in de Hábitos</p>
                  <p className="text-xs text-text-secondary mt-1">Registra tu sueño, digestión, dolor y nivel de energía del día de hoy.</p>
                </div>
                <button
                  onClick={() => setIsCheckInOpen(true)}
                  className="w-full py-2 bg-salud-blue text-white rounded-[var(--radius-md)] font-bold text-sm shadow-sm shadow-salud-blue/20 hover:bg-salud-blue-hover transition-colors cursor-pointer active:scale-[0.98]"
                >
                  Hacer mi Check-in
                </button>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-4 flex flex-col">
          {/* Reto Semanal Dinámico */}
          <Card padding="md" className="flex-1 flex flex-col justify-center">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold text-salud-amber flex items-center gap-1.5">
                  <Trophy size={16} /> {reto ? reto.title : 'Reto Semanal'}
                </h2>
                <p className="text-text-primary text-sm font-medium mt-1">
                  {reto ? (
                    <span className="flex items-start gap-1">
                      {reto.icon && <span>{reto.icon}</span>}
                      <span>{reto.description}</span>
                    </span>
                  ) : (
                    'Mantente activo y bebe agua.'
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* Rutina de Rehabilitación */}
          <Card padding="md" className="flex-1 flex flex-col justify-center">
            <h2 className="text-base font-bold text-text-primary mb-2">Rutina de Rehabilitación</h2>

            {hasRutina ? (
              <>
                {/* Lista de ítems de la rutina */}
                {rutinaItems && rutinaItems.length > 0 ? (
                  <ul className="space-y-1.5 mb-3">
                    {rutinaItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-salud-blue-soft text-salud-blue flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {/* Botón de video: solo si hay URL */}
                {rutinaVideoUrl ? (
                  <a
                    href={rutinaVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto sm:px-4 bg-white text-salud-blue font-bold py-1.5 text-xs rounded-[var(--radius-md)] border border-salud-blue/20 shadow-sm flex items-center justify-center gap-2 hover:bg-salud-blue-soft transition-colors cursor-pointer active:scale-[0.98] mt-auto"
                  >
                    <PlayCircle size={18} />
                    Ver Guía en Video
                  </a>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-text-tertiary mt-auto pt-2 border-t border-border/40">
                    <PlayCircle size={14} className="opacity-40" />
                    <span>El video guía estará disponible pronto</span>
                  </div>
                )}
              </>
            ) : (
              /* Estado vacío: sin rutina asignada por el equipo médico */
              <div className="flex flex-col items-center justify-center text-center py-4 gap-2">
                <span className="text-3xl opacity-30">🏃‍♂️</span>
                <p className="text-xs text-text-tertiary leading-relaxed max-w-[180px]">
                  Próximamente tu nutricionista subirá una rutina adecuada para ti
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Guías e Infografías */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pb-4">
        <button
          id="btn-guia-nutricional"
          onClick={() => setShowGuiasModal(true)}
          className="flex flex-col items-center justify-center p-3 rounded-[var(--radius-md)] border border-border bg-bg-card hover:border-salud-blue/30 hover:bg-salud-blue-soft/20 transition-all text-salud-blue cursor-pointer h-24 active:scale-[0.97]"
        >
          <BookOpen size={24} className="mb-2" />
          <span className="text-xs font-bold text-text-primary text-center leading-tight">Mi Guía Nutricional</span>
        </button>
        <button 
          onClick={() => setShowInfografiasModal(true)}
          className="flex flex-col items-center justify-center p-3 rounded-[var(--radius-md)] border border-border bg-bg-card hover:border-salud-green/30 hover:bg-salud-green-soft/20 transition-all text-salud-green cursor-pointer h-24 active:scale-[0.97]"
        >
          <Info size={24} className="mb-2" />
          <span className="text-xs font-bold text-text-primary text-center leading-tight">Infografías Médicas</span>
        </button>
        {/* <button className="hidden lg:flex flex-col items-center justify-center p-3 rounded-[var(--radius-md)] border border-border bg-bg-card hover:border-salud-amber/30 transition-all text-salud-amber cursor-pointer h-24">
          <Trophy size={24} className="mb-2" />
          <span className="text-xs font-bold text-text-primary text-center leading-tight">Logros Semanales</span>
        </button>
        <button className="hidden lg:flex flex-col items-center justify-center p-3 rounded-[var(--radius-md)] border border-border bg-bg-card hover:border-salud-purple/30 transition-all text-salud-purple cursor-pointer h-24">
          <PlayCircle size={24} className="mb-2" />
          <span className="text-xs font-bold text-text-primary text-center leading-tight">Videos Educativos</span>
        </button> */}
      </div>
      <CheckInModal isOpen={isCheckInOpen} onClose={() => setIsCheckInOpen(false)} selectedDate={selectedDate} />
      <NutritionGuidesModal
        isOpen={showGuiasModal}
        onClose={() => setShowGuiasModal(false)}
        condicionesPaciente={evaluacion.condiciones || []}
      />
      <PatientInfografiasModal
        isOpen={showInfografiasModal}
        onClose={() => setShowInfografiasModal(false)}
        infografias={state.infografias || []}
      />
    </div>
  );
}
