import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, Edit, FileText, Activity, AlertTriangle, 
  Calendar, Scale, Droplets, Target, User, HeartPulse, Pill, TrendingUp, Table
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useStaff } from '../../contexts/StaffContext';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Tabs, { useTabs } from '../../components/ui/Tabs';
import SlideOver from '../../components/ui/SlideOver';
import type { Evaluacion } from '../../types/patients';

// =============================================
// Staff: Detalle de Paciente
// =============================================

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPatientById, addPrescription, getPatientEvaluations, dispatch } = useStaff();
  
  const patient = id ? getPatientById(id) : undefined;
  const evaluations = patient ? getPatientEvaluations(patient.id) : [];
  const latestLabs = evaluations[0]?.laboratorios || patient?.laboratorios;
  const latestComp = evaluations[0]?.composicionCorporal || patient?.composicionCorporal;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const { activeTab, setActiveTab } = useTabs('plan');
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluacion | null>(null);

  const [newPrescription, setNewPrescription] = useState({
    medicamento: '',
    dosis: '',
    frecuencia: '',
    duracionDias: 30,
    indicaciones: ''
  });

  const [planForm, setPlanForm] = useState({
    get: 0,
    pctProteina: 30,
    pctGrasa: 25,
    pctCarbs: 45,
    metaHidratacionMl: 2000,
    alertaHidratacion: false,
  });
  const [planSaving, setPlanSaving] = useState(false);

  const [patientState, setPatientState] = useState<any>({ diario: {}, prescripciones: [] });

  useEffect(() => {
    if (!patient?.id) return;
    
    let channels: any[] = [];
    
    async function fetchPatientData() {
      if (!patient?.id) return;
      const [
        { data: logs },
        { data: prescriptions }
      ] = await Promise.all([
        supabase.from('patient_daily_logs').select('*').eq('patient_id', patient.id),
        supabase.from('patient_prescriptions').select('*').eq('patient_id', patient.id).eq('activa', true)
      ]);
      
      const diario: any = {};
      logs?.forEach((log: any) => {
        diario[log.fecha] = {
          fecha: log.fecha,
          hidratacionMl: log.hidratacion_ml,
          comidasRegistradas: log.comidas_registradas || {},
          habitos: log.habitos || {},
          adherenciaPrescripciones: log.adherencia_prescripciones || []
        };
      });
      
      const prescripciones = prescriptions?.map((p: any) => ({
        id: p.id,
        medicamento: p.medicamento,
        dosis: p.dosis,
        frecuencia: p.frecuencia,
        duracionDias: p.duracion_dias,
        indicaciones: p.indicaciones,
        fechaInicio: p.fecha_inicio,
        activa: p.activa
      })) || [];
      
      setPatientState({ diario, prescripciones });
    }
    
    fetchPatientData();
    
    const channel = supabase.channel(`staff-patient-${patient.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_daily_logs', filter: `patient_id=eq.${patient.id}` }, () => fetchPatientData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_prescriptions', filter: `patient_id=eq.${patient.id}` }, () => fetchPatientData())
      .subscribe();
      
    channels.push(channel);
    
    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [patient?.id]);

  const prescripciones = patientState.prescripciones || [];

  if (!patient) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <button
          onClick={() => navigate('/staff/pacientes')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} /> Volver al directorio
        </button>
        <EmptyState
          title="Paciente no encontrado"
          description="El paciente que buscas no existe o ha sido eliminado del sistema."
          action={<Button onClick={() => navigate('/staff/pacientes')}>Ir al directorio</Button>}
        />
      </div>
    );
  }

  const getStatusBadge = (estatus: string) => {
    switch (estatus) {
      case 'activo': return <Badge variant="success" dot>Activo</Badge>;
      case 'inactivo': return <Badge variant="warning" dot>Inactivo</Badge>;
      case 'alta': return <Badge variant="info" dot>Alta</Badge>;
      default: return <Badge>{estatus}</Badge>;
    }
  };

  const hasCriticalConditions = patient.condiciones.some(c => 
    ['Diabetes 1', 'Diabetes 2', 'Hipertensión'].includes(c)
  );

  const getHistoricalData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const fechaIso = d.toISOString().split('T')[0];
      const diaStr = d.toLocaleDateString('es-MX', { weekday: 'short' });
      
      const log = patientState?.diario?.[fechaIso];
      let adherencia = 0;
      
      if (log && log.adherenciaPrescripciones) {
        const total = patientState?.prescripciones?.length || 0;
        const tomadas = log.adherenciaPrescripciones.filter((p: any) => p.tomada).length;
        adherencia = total > 0 ? Math.round((tomadas / total) * 100) : 0;
      }
      
      const glucosa = log?.habitos?.glucosaCapilar || 0;
      
      data.push({
        fecha: diaStr,
        fechaIso,
        adherencia,
        glucosa,
        dolor: log?.habitos?.nivelDolor || 0,
        hidratacion: log?.hidratacionMl || 0,
      });
    }
    return data;
  };

  const historicalData = patient ? getHistoricalData() : [];

  const recentAlerts = historicalData.filter(d => d.hidratacion < 1500 || d.adherencia < 50);
  const isHighRisk = recentAlerts.length >= 3;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/staff/pacientes')}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft size={18} /> Volver al directorio
      </button>

      {/* Header Profile */}
      <Card padding="lg" className="border-t-4 border-t-salud-blue relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <User size={150} />
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="flex items-start gap-5">
            <Avatar nombre={patient.nombre} apellido={patient.apellido} role="paciente" size="xl" />
            <div className="space-y-2">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-extrabold text-text-primary">
                    {patient.nombre} {patient.apellido || ''}
                  </h1>
                  {getStatusBadge(patient.estatus)}
                </div>
                <p className="text-sm text-text-secondary mt-0.5">{patient.email}</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-text-tertiary">
                <span className="flex items-center gap-1.5"><Calendar size={14}/> {patient.edad} años</span>
                <span className="flex items-center gap-1.5"><User size={14}/> {patient.sexo === 'hombre' ? 'Hombre' : 'Mujer'}</span>
                <span className="flex items-center gap-1.5"><Scale size={14}/> {patient.tallaCm} cm</span>
                {patient.tipoSangre && (
                  <span className="flex items-center gap-1.5"><Droplets size={14}/> {patient.tipoSangre}</span>
                )}
                {patient.telefono && (
                  <span className="flex items-center gap-1.5">📞 {patient.telefono}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="secondary"
              icon={<Edit size={16} />}
              className="flex-1 md:flex-none justify-center"
              onClick={() => navigate(`/staff/pacientes/${patient.id}/editar`)}
            >
              Editar Datos
            </Button>
            <Button 
              variant="primary" 
              onClick={() => navigate(`/staff/pacientes/${patient.id}/evaluar`)}
              icon={<FileText size={16} />} 
              className="flex-1 md:flex-none justify-center"
            >
              Nueva Evaluación
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Clinical Info */}
        <div className="space-y-6 lg:col-span-1">
          {/* Condiciones y Alertas */}
          <Card padding="md">
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse size={18} className="text-salud-red" />
              <h2 className="text-base font-bold text-text-primary">Perfil Clínico</h2>
            </div>
            
            {hasCriticalConditions && (
              <div className="bg-bg-elevated border border-border/40 rounded-[var(--radius-md)] p-3 mb-4 flex items-start gap-2">
                <AlertTriangle size={16} className="text-salud-red flex-shrink-0 mt-0.5" />
                <p className="text-xs text-salud-red font-semibold leading-tight">
                  Paciente de alto riesgo. Monitorear adherencia a dieta.
                </p>
              </div>
            )}
            
            {isHighRisk && (
              <div className="bg-bg-elevated border border-border/40 rounded-[var(--radius-md)] p-3 mb-4 flex items-start gap-2 animate-pulse-soft">
                <AlertTriangle size={16} className="text-salud-amber flex-shrink-0 mt-0.5" />
                <p className="text-xs text-salud-amber font-semibold leading-tight">
                  Alerta Preventiva: Bajo consumo de agua o baja adherencia recurrente (últimos 3 días).
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <p className="text-xs text-text-tertiary font-bold uppercase tracking-wider mb-2">Condiciones Médicas</p>
                {patient.condiciones.length > 0 && !patient.condiciones.includes('ninguno') ? (
                  <div className="flex flex-wrap gap-1.5">
                    {patient.condiciones.map(c => (
                      <span key={c} className="text-xs font-bold text-salud-amber bg-salud-amber-soft/40 px-2 py-1 rounded-md border border-salud-amber/20">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-text-secondary">Sin condiciones reportadas</span>
                )}
              </div>

              <div>
                <p className="text-xs text-text-tertiary font-bold uppercase tracking-wider mb-2">Alergias / Restricciones</p>
                {patient.alergias && patient.alergias.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {patient.alergias.map((a: string) => (
                      <span key={a} className="text-xs font-bold text-salud-red bg-salud-red-soft/40 px-2 py-1 rounded-md border border-salud-red/20">
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-text-secondary">Sin alergias registradas</span>
                )}
              </div>
            </div>
          </Card>

          {/* Antropometría (Última Eval) */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Scale size={18} className="text-salud-blue" />
                <h2 className="text-base font-bold text-text-primary">Últimas Medidas</h2>
              </div>
              <span className="text-xs text-text-tertiary">
                {patient.ultimaEvaluacion ? new Date(patient.ultimaEvaluacion).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-elevated p-3 rounded-[var(--radius-md)]">
                <p className="text-xs text-text-secondary mb-1">Peso</p>
                <p className="text-lg font-bold text-text-primary">{patient.pesoKg} <span className="text-sm font-normal text-text-tertiary">kg</span></p>
              </div>
              <div className="bg-bg-elevated p-3 rounded-[var(--radius-md)]">
                <p className="text-xs text-text-secondary mb-1">Cintura</p>
                <p className="text-lg font-bold text-text-primary">{patient.cinturaCm} <span className="text-sm font-normal text-text-tertiary">cm</span></p>
              </div>
              <div className="bg-bg-elevated p-3 rounded-[var(--radius-md)]">
                <p className="text-xs text-text-secondary mb-1">IMC</p>
                <p className="text-lg font-bold text-salud-blue">{patient.resultadosActuales?.imc.toFixed(1) || '—'}</p>
              </div>
              <div className="bg-bg-elevated p-3 rounded-[var(--radius-md)]">
                <p className="text-xs text-text-secondary mb-1">Cadera</p>
                <p className="text-lg font-bold text-text-primary">{patient.caderaCm} <span className="text-sm font-normal text-text-tertiary">cm</span></p>
              </div>
            </div>
          </Card>

          {/* Laboratorios y HOMA-IR */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-salud-red" />
                <h2 className="text-base font-bold text-text-primary">Laboratorios / HOMA-IR</h2>
              </div>
              {latestLabs?.homaIr && (
                <Badge variant="warning" dot>
                  HOMA-IR: {latestLabs.homaIr}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-bg-elevated p-2.5 rounded-[var(--radius-md)]">
                <span className="text-text-secondary block">Glucosa Ayunas</span>
                <strong className="text-sm text-text-primary">
                  {latestLabs?.glucosa ? `${latestLabs.glucosa} mg/dL` : '—'}
                </strong>
              </div>
              <div className="bg-bg-elevated p-2.5 rounded-[var(--radius-md)]">
                <span className="text-text-secondary block">Insulina Basal</span>
                <strong className="text-sm text-text-primary">
                  {latestLabs?.insulina ? `${latestLabs.insulina} µU/mL` : '—'}
                </strong>
              </div>
              <div className="bg-bg-elevated p-2.5 rounded-[var(--radius-md)] col-span-2 flex justify-between">
                <span className="text-text-secondary">PA: <strong className="text-text-primary">{latestLabs?.presionArterial || '—'}</strong></span>
                <span className="text-text-secondary">Lip: <strong className="text-text-primary">{latestLabs?.perfilLipidico || '—'}</strong></span>
              </div>
            </div>
          </Card>

          {/* Composición Corporal (Bioimpedancia) */}
          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">⚡</span>
              <h2 className="text-base font-bold text-text-primary">Composición Corporal</h2>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-bg-elevated p-2.5 rounded-[var(--radius-md)]">
                <span className="text-text-secondary block">Grasa Corporal</span>
                <strong className="text-sm text-text-primary">
                  {latestComp?.porcentajeGrasa ? `${latestComp.porcentajeGrasa}%` : '—'}
                </strong>
              </div>
              <div className="bg-bg-elevated p-2.5 rounded-[var(--radius-md)]">
                <span className="text-text-secondary block">Grasa Visceral</span>
                <strong className="text-sm text-salud-amber">
                  {latestComp?.grasaVisceral ? `Nivel ${latestComp.grasaVisceral}` : '—'}
                </strong>
              </div>
              <div className="bg-bg-elevated p-2.5 rounded-[var(--radius-md)]">
                <span className="text-text-secondary block">Músculo Esquelético</span>
                <strong className="text-sm text-salud-green">
                  {latestComp?.musculoEsqueletico ? `${latestComp.musculoEsqueletico}%` : '—'}
                </strong>
              </div>
              <div className="bg-bg-elevated p-2.5 rounded-[var(--radius-md)]">
                <span className="text-text-secondary block">Músculo (kg)</span>
                <strong className="text-sm text-text-primary">
                  {latestComp?.musculoEsqueleticoKg ? `${latestComp.musculoEsqueleticoKg} kg` : '—'}
                </strong>
              </div>
            </div>
          </Card>

          {/* Prescripciones Médicas */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill size={18} className="text-salud-purple" />
                <h2 className="text-base font-bold text-text-primary">Prescripciones</h2>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(true)}>
                Añadir
              </Button>
            </div>
            
            <div className="space-y-3">
              {prescripciones.length > 0 ? (
                prescripciones.map((p: any) => (
                  <div key={p.id} className="p-3 border border-border/40 rounded-[var(--radius-md)] bg-bg-elevated/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-salud-purple flex items-center gap-1.5">
                          💊 {p.medicamento}
                        </p>
                        <p className="text-xs text-text-primary font-medium mt-1">{p.dosis} • {p.frecuencia}</p>
                        <p className="text-[11px] text-text-secondary mt-0.5">{p.indicaciones}</p>
                      </div>
                      <Badge variant={p.activa ? 'success' : 'default'} dot>{p.activa ? 'Activa' : 'Inactiva'}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-text-tertiary">No hay medicamentos prescritos.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Diet and Tracking */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Tabs Navigation */}
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: 'plan', label: 'Plan Actual', icon: <Target size={16} /> },
              { id: 'evolucion', label: 'Evolución', icon: <TrendingUp size={16} /> },
              { id: 'historial', label: 'Historial Clínico', icon: <Activity size={16} />, badge: evaluations.length }
            ]}
          />

          {/* TAB 1: PLAN ACTUAL */}
          {activeTab === 'plan' && (
            <Card padding="lg" className="animate-fade-in">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Target size={20} className="text-salud-green" />
                  <h2 className="text-lg font-bold text-text-primary">Plan Nutricional Activo</h2>
                </div>
                <Badge variant="success">Dieta Asignada</Badge>
              </div>

              {patient.resultadosActuales ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between bg-bg-elevated border border-border/40 p-4 rounded-[var(--radius-lg)]">
                    <div>
                      <p className="text-sm font-bold text-salud-green uppercase tracking-wide mb-1">Objetivo Metabólico</p>
                      <p className="text-2xl font-extrabold text-text-primary">{patient.resultadosActuales.get.toFixed(0)} kcal / día</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (patient.resultadosActuales) {
                          const r = patient.resultadosActuales;
                          const totalKcal = r.get;
                          const pctProt = Math.round((r.macros.proteinas.kcal / totalKcal) * 100);
                          const pctGrasa = Math.round((r.macros.grasas.kcal / totalKcal) * 100);
                          const pctCarbs = Math.round((r.macros.carbohidratos.kcal / totalKcal) * 100);
                          setPlanForm({
                            get: Math.round(r.get),
                            pctProteina: pctProt,
                            pctGrasa: pctGrasa,
                            pctCarbs: pctCarbs,
                            metaHidratacionMl: r.metaHidratacionMl,
                            alertaHidratacion: r.alertaHidratacion,
                          });
                        }
                        setShowPlanModal(true);
                      }}
                    >
                      Modificar Plan
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 border border-border/60 rounded-[var(--radius-md)] text-center">
                      <p className="text-lg font-bold text-salud-blue">{patient.resultadosActuales.macros.proteinas.gramos.toFixed(0)}g</p>
                      <p className="text-xs font-semibold text-text-secondary mt-0.5">Proteína ({patient.resultadosActuales.macros.proteinas.porcentaje}%)</p>
                    </div>
                    <div className="p-3 border border-border/60 rounded-[var(--radius-md)] text-center">
                      <p className="text-lg font-bold text-salud-amber">{patient.resultadosActuales.macros.carbohidratos.gramos.toFixed(0)}g</p>
                      <p className="text-xs font-semibold text-text-secondary mt-0.5">Carbos ({patient.resultadosActuales.macros.carbohidratos.porcentaje}%)</p>
                    </div>
                    <div className="p-3 border border-border/60 rounded-[var(--radius-md)] text-center">
                      <p className="text-lg font-bold text-text-primary">{patient.resultadosActuales.macros.grasas.gramos.toFixed(0)}g</p>
                      <p className="text-xs font-semibold text-text-secondary mt-0.5">Grasas ({patient.resultadosActuales.macros.grasas.porcentaje}%)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-bg-elevated rounded-[var(--radius-md)]">
                    <Droplets size={20} className="text-salud-blue" />
                    <div>
                      <p className="text-sm font-bold text-text-primary">Meta de Hidratación: {patient.resultadosActuales.metaHidratacionMl} ml/día</p>
                      {patient.resultadosActuales.alertaHidratacion && (
                        <p className="text-xs text-salud-amber font-semibold mt-0.5">Alerta de restricción hídrica activada</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="Sin plan nutricional"
                  description="Realiza una evaluación para generar los cálculos metabólicos del paciente."
                  action={<Button icon={<FileText size={16} />} size="sm" onClick={() => navigate(`/staff/pacientes/${patient.id}/evaluar`)}>Crear Evaluación</Button>}
                />
              )}
            </Card>
          )}

          {/* TAB 2: EVOLUCION */}
          {activeTab === 'evolucion' && (
            <Card padding="md" className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-salud-green" />
                  <h2 className="text-base font-bold text-text-primary">Correlación (7 días)</h2>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setShowReport(true)} icon={<Table size={16} />}>
                  Reporte
                </Button>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                    <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} domain={[0, 100]} />
                    {(patient.condiciones.includes('Diabetes 1') || patient.condiciones.includes('Diabetes 2')) && (
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                    )}
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="adherencia" name="Adherencia %" stroke="#0D9488" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    {(patient.condiciones.includes('Diabetes 1') || patient.condiciones.includes('Diabetes 2')) && (
                      <Line yAxisId="right" type="monotone" dataKey="glucosa" name="Glucosa" stroke="#E11D48" strokeWidth={3} dot={{ r: 4 }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* TAB 3: HISTORIAL CLINICO */}
          {activeTab === 'historial' && (
            <Card padding="md" className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-salud-blue" />
                  <h2 className="text-base font-bold text-text-primary">Evaluaciones Realizadas</h2>
                </div>
              </div>

              {evaluations.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {evaluations.map((evaluacion, index) => {
                    // Calcular comparativa de peso con la anterior (que en el array invertido es index+1)
                    const prevEval = index < evaluations.length - 1 ? evaluations[index + 1] : null;
                    const diffPeso = prevEval ? (evaluacion.pesoKg - prevEval.pesoKg).toFixed(1) : null;
                    const isDiffPositive = diffPeso && Number(diffPeso) > 0;
                    
                    return (
                      <div 
                        key={evaluacion.id} 
                        onClick={() => setSelectedEvaluation(evaluacion)}
                        className="flex items-center justify-between p-3 border border-border/40 rounded-[var(--radius-md)] hover:border-salud-blue/30 hover:bg-bg-elevated transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-salud-blue-soft flex items-center justify-center text-salud-blue flex-shrink-0">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-primary group-hover:text-salud-blue transition-colors">
                              {index === evaluations.length - 1 ? 'Evaluación Inicial' : `Seguimiento #${evaluations.length - index}`}
                            </p>
                            <p className="text-xs text-text-tertiary">{new Date(evaluacion.fecha).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          {diffPeso && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDiffPositive ? 'bg-salud-amber-soft text-salud-amber' : 'bg-salud-green-soft text-salud-green'}`}>
                              {isDiffPositive ? '+' : ''}{diffPeso} kg
                            </span>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-text-primary">{evaluacion.pesoKg} kg</p>
                            <p className="text-xs text-text-tertiary">IMC {evaluacion.resultados?.imc?.toFixed(1) || '—'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-text-tertiary">No hay evaluaciones previas.</p>
                </div>
              )}
            </Card>
          )}
        </div>

      </div>

      {/* Modal Nueva Prescripción */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border/60 rounded-[var(--radius-lg)] shadow-xl w-full max-w-md max-h-[90vh] flex flex-col animate-slide-up">
            <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Pill size={18} className="text-salud-purple" /> Nueva Prescripción
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-tertiary hover:text-text-primary">
                &times;
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Medicamento</label>
                <Input 
                  type="text" placeholder="Ej. Metformina" 
                  value={newPrescription.medicamento}
                  onChange={e => setNewPrescription(p => ({ ...p, medicamento: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">Dosis</label>
                  <Input 
                    type="text" placeholder="Ej. 500mg" 
                    value={newPrescription.dosis}
                    onChange={e => setNewPrescription(p => ({ ...p, dosis: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">Duración (días)</label>
                  <Input 
                    type="number" placeholder="30" 
                    value={newPrescription.duracionDias}
                    onChange={e => setNewPrescription(p => ({ ...p, duracionDias: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Frecuencia</label>
                <Input 
                  type="text" placeholder="Ej. 1 tableta cada 8 horas" 
                  value={newPrescription.frecuencia}
                  onChange={e => setNewPrescription(p => ({ ...p, frecuencia: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">Indicaciones (opcional)</label>
                <Textarea 
                  placeholder="Ej. Tomar después del desayuno" 
                  value={newPrescription.indicaciones}
                  onChange={e => setNewPrescription(p => ({ ...p, indicaciones: e.target.value }))}
                />
              </div>
            </div>
            <div className="p-4 border-t border-border/60 bg-bg-elevated/30 flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={() => {
                if (!newPrescription.medicamento || !newPrescription.dosis || !newPrescription.frecuencia) {
                  alert('Completa medicamento, dosis y frecuencia');
                  return;
                }
                addPrescription(patient.id, newPrescription);
                setIsModalOpen(false);
                setNewPrescription({ medicamento: '', dosis: '', frecuencia: '', duracionDias: 30, indicaciones: '' });
              }}>Guardar Prescripción</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reporte Consolidado */}
      {showReport && (
        <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border/60 rounded-[var(--radius-lg)] shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-slide-up">
            <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Table size={18} className="text-salud-blue" /> Reporte Consolidado (Últimos 7 días)
              </h3>
              <button onClick={() => setShowReport(false)} className="text-text-tertiary hover:text-text-primary">
                &times;
              </button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              <table className="w-full text-left text-sm text-text-secondary">
                <thead className="bg-bg-elevated/50 text-xs uppercase font-bold text-text-tertiary">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Adherencia</th>
                    <th className="px-4 py-3">Agua (ml)</th>
                    <th className="px-4 py-3">Dolor</th>
                    <th className="px-4 py-3">Glucosa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {historicalData.map((d, idx) => (
                    <tr key={idx} className="hover:bg-bg-elevated/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-text-primary capitalize">{d.fecha}</td>
                      <td className="px-4 py-3">
                        <Badge variant={d.adherencia >= 80 ? 'success' : d.adherencia >= 50 ? 'warning' : 'danger'}>
                          {d.adherencia}%
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{d.hidratacion} ml</td>
                      <td className="px-4 py-3">{d.dolor} / 5</td>
                      <td className="px-4 py-3">{d.glucosa ? `${d.glucosa} mg/dL` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-border/60 bg-bg-elevated/30 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setShowReport(false)}>Cerrar Reporte</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modificar Plan Nutricional */}
      {showPlanModal && patient?.resultadosActuales && (
        <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border/60 rounded-[var(--radius-lg)] shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up">
            {/* Header */}
            <div className="p-5 border-b border-border/60 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Target size={18} className="text-salud-green" />
                Modificar Plan Nutricional
              </h3>
              <button
                onClick={() => setShowPlanModal(false)}
                className="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              {/* GET */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                  Objetivo Calórico (GET)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min={800}
                    max={5000}
                    value={planForm.get}
                    onChange={e => setPlanForm(f => ({ ...f, get: Number(e.target.value) }))}
                    rightElement={<span className="text-xs text-text-tertiary">kcal/día</span>}
                  />
                </div>
                <p className="text-xs text-text-tertiary mt-1">Rango recomendado: 1000 – 4000 kcal/día</p>
              </div>

              {/* Macros */}
              <div>
                <p className="text-sm font-semibold text-text-secondary mb-3">Distribución de Macronutrientes</p>
                <div className="space-y-3">
                  {/* Proteína */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-salud-blue w-24 shrink-0">Proteína (%)</span>
                    <input
                      type="range" min={10} max={50} step={1}
                      value={planForm.pctProteina}
                      onChange={e => {
                        const val = Number(e.target.value);
                        const remaining = 100 - val - planForm.pctGrasa;
                        setPlanForm(f => ({ ...f, pctProteina: val, pctCarbs: Math.max(0, remaining) }));
                      }}
                      className="flex-1 accent-salud-blue"
                    />
                    <span className="text-sm font-bold text-salud-blue w-10 text-right">{planForm.pctProteina}%</span>
                    <span className="text-xs text-text-tertiary w-16 text-right">
                      {Math.round((planForm.get * planForm.pctProteina / 100) / 4)}g
                    </span>
                  </div>
                  {/* Grasas */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-text-primary w-24 shrink-0">Grasas (%)</span>
                    <input
                      type="range" min={10} max={45} step={1}
                      value={planForm.pctGrasa}
                      onChange={e => {
                        const val = Number(e.target.value);
                        const remaining = 100 - val - planForm.pctProteina;
                        setPlanForm(f => ({ ...f, pctGrasa: val, pctCarbs: Math.max(0, remaining) }));
                      }}
                      className="flex-1 accent-gray-500"
                    />
                    <span className="text-sm font-bold text-text-primary w-10 text-right">{planForm.pctGrasa}%</span>
                    <span className="text-xs text-text-tertiary w-16 text-right">
                      {Math.round((planForm.get * planForm.pctGrasa / 100) / 9)}g
                    </span>
                  </div>
                  {/* Carbohidratos (calculado) */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-salud-amber w-24 shrink-0">Carbos (%)</span>
                    <div className="flex-1 h-[6px] bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-salud-amber/60 rounded-full transition-all"
                        style={{ width: `${Math.max(0, planForm.pctCarbs)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-salud-amber w-10 text-right">
                      {Math.max(0, planForm.pctCarbs)}%
                    </span>
                    <span className="text-xs text-text-tertiary w-16 text-right">
                      {Math.round((planForm.get * Math.max(0, planForm.pctCarbs) / 100) / 4)}g
                    </span>
                  </div>
                </div>
                {/* Total visual */}
                <div className={`mt-3 text-xs font-bold text-right ${
                  planForm.pctProteina + planForm.pctGrasa + Math.max(0, planForm.pctCarbs) === 100
                    ? 'text-salud-green' : 'text-salud-red'
                }`}>
                  Total: {planForm.pctProteina + planForm.pctGrasa + Math.max(0, planForm.pctCarbs)}%
                  {planForm.pctProteina + planForm.pctGrasa + Math.max(0, planForm.pctCarbs) !== 100 && ' — debe sumar 100%'}
                </div>
              </div>

              {/* Hidratación */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1">
                  Meta de Hidratación
                </label>
                <Input
                  type="number"
                  min={500}
                  max={5000}
                  step={50}
                  value={planForm.metaHidratacionMl}
                  onChange={e => setPlanForm(f => ({ ...f, metaHidratacionMl: Number(e.target.value) }))}
                  rightElement={<span className="text-xs text-text-tertiary">ml/día</span>}
                />
              </div>

              {/* Alerta Hidratación */}
              <div className="flex items-center gap-3 p-3 bg-bg-elevated rounded-[var(--radius-md)] border border-border/40">
                <button
                  type="button"
                  onClick={() => setPlanForm(f => ({ ...f, alertaHidratacion: !f.alertaHidratacion }))}
                  className={`w-10 h-5 rounded-full transition-colors shrink-0 relative ${
                    planForm.alertaHidratacion ? 'bg-salud-amber' : 'bg-border'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    planForm.alertaHidratacion ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Alerta de restricción hídrica</p>
                  <p className="text-xs text-text-tertiary">Activa si el paciente tiene Hipertensión u otras condiciones</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/60 bg-bg-elevated/30 flex items-center justify-between gap-3">
              <p className="text-xs text-text-tertiary">
                Los cambios se aplican de inmediato al perfil del paciente.
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowPlanModal(false)}>Cancelar</Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={planSaving ||
                    planForm.pctProteina + planForm.pctGrasa + Math.max(0, planForm.pctCarbs) !== 100 ||
                    planForm.get < 800
                  }
                  onClick={async () => {
                    setPlanSaving(true);
                    try {
                      const { get: targetGet, pctProteina, pctGrasa, metaHidratacionMl, alertaHidratacion } = planForm;
                      const pctCarbs = Math.max(0, 100 - pctProteina - pctGrasa);

                      const kcalProt = targetGet * (pctProteina / 100);
                      const kcalGrasa = targetGet * (pctGrasa / 100);
                      const kcalCHO = targetGet * (pctCarbs / 100);

                      const updatedResultados = {
                        ...patient.resultadosActuales!,
                        get: targetGet,
                        metaHidratacionMl,
                        alertaHidratacion,
                        macros: {
                          proteinas: {
                            gramos: kcalProt / 4,
                            kcal: kcalProt,
                            porcentaje: pctProteina,
                            kcalPorGramo: 4,
                          },
                          grasas: {
                            gramos: kcalGrasa / 9,
                            kcal: kcalGrasa,
                            porcentaje: pctGrasa,
                            kcalPorGramo: 9,
                          },
                          carbohidratos: {
                            gramos: kcalCHO / 4,
                            kcal: kcalCHO,
                            porcentaje: pctCarbs,
                            kcalPorGramo: 4,
                          },
                          totalKcal: targetGet,
                        },
                      };

                      const { error } = await supabase
                        .from('patients')
                        .update({ resultados_actuales: updatedResultados, updated_at: new Date().toISOString() })
                        .eq('id', patient.id);

                      if (error) throw error;

                      dispatch({ type: 'UPDATE_PATIENT', payload: { ...patient, resultadosActuales: updatedResultados } });
                      setShowPlanModal(false);
                    } catch (err) {
                      console.error('Error actualizando plan:', err);
                      alert('Error al guardar el plan. Intenta de nuevo.');
                    } finally {
                      setPlanSaving(false);
                    }
                  }}
                >
                  {planSaving ? 'Guardando…' : 'Guardar Plan'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SlideOver Evaluacion */}
      <SlideOver
        isOpen={!!selectedEvaluation}
        onClose={() => setSelectedEvaluation(null)}
        title={selectedEvaluation ? `Detalle de Evaluación` : ''}
        width="max-w-md"
      >
        {selectedEvaluation && (
          <div className="space-y-6 pb-8 mt-2">
            <div>
              <p className="text-xs text-text-tertiary font-bold uppercase mb-1">Fecha</p>
              <p className="text-base font-semibold text-text-primary">{new Date(selectedEvaluation.fecha).toLocaleDateString()}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg-elevated p-3 rounded-lg border border-border/40">
                <p className="text-xs text-text-secondary mb-1">Peso</p>
                <p className="text-lg font-bold text-text-primary">{selectedEvaluation.pesoKg} kg</p>
              </div>
              <div className="bg-bg-elevated p-3 rounded-lg border border-border/40">
                <p className="text-xs text-text-secondary mb-1">IMC</p>
                <p className="text-lg font-bold text-salud-blue">{selectedEvaluation.resultados?.imc?.toFixed(1) || '—'}</p>
              </div>
              <div className="bg-bg-elevated p-3 rounded-lg border border-border/40">
                <p className="text-xs text-text-secondary mb-1">Cintura</p>
                <p className="text-lg font-bold text-text-primary">{selectedEvaluation.cinturaCm} cm</p>
              </div>
              <div className="bg-bg-elevated p-3 rounded-lg border border-border/40">
                <p className="text-xs text-text-secondary mb-1">Cadera</p>
                <p className="text-lg font-bold text-text-primary">{selectedEvaluation.caderaCm} cm</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-text-tertiary font-bold uppercase mb-1">Notas Privadas del Profesional</p>
                <div className="p-3 bg-bg-card rounded-lg border border-border/40 text-sm text-text-secondary min-h-[80px]">
                  {selectedEvaluation.notasProfesional || 'Sin notas registradas en esta evaluación.'}
                </div>
              </div>

              <div>
                <p className="text-xs text-salud-green font-bold uppercase mb-1">Indicaciones al Paciente</p>
                <div className="p-3 bg-bg-elevated rounded-[var(--radius-md)] border border-border/40 text-sm text-text-secondary min-h-[80px]">
                  {selectedEvaluation.indicacionesPaciente || 'Sin indicaciones adicionales registradas.'}
                </div>
              </div>
            </div>
            
            {selectedEvaluation.nivelEnergia !== undefined && (
              <div className="pt-4 border-t border-border/40">
                <h4 className="text-sm font-bold text-text-primary mb-3">Feedback del Paciente</h4>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p><span className="font-semibold">Nivel de Energía:</span> {selectedEvaluation.nivelEnergia} / 10</p>
                  <p><span className="font-semibold">Digestión:</span> <span className="capitalize">{selectedEvaluation.calidadDigestion}</span></p>
                  <p><span className="font-semibold">Ansiedad:</span> <span className="capitalize">{selectedEvaluation.nivelAnsiedad}</span></p>
                </div>
              </div>
            )}
          </div>
        )}
      </SlideOver>
    </div>
  );
}
