import { useState, useRef, useEffect, useCallback } from 'react';
import { usePatient } from '../App';
import { useNavigate } from 'react-router-dom';
import EmptyPatientState from '../components/patient/EmptyPatientState';
import { ChevronLeft, ChevronRight, Volume2, CheckCircle2, CheckSquare, Square, ChefHat, UtensilsCrossed } from 'lucide-react';
import type { MenuRacion, MenuTiempo } from '../types';
import { getSmaeRecord, evaluateMenu, asignarPlantillaOptima } from '../utils/engine';
import Card from '../components/ui/Card';

import MacroChart from '../components/dashboard/MacroChart';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

interface MealSectionProps {
  meal: MenuTiempo;
  restricciones: string[];
  delay?: string;
  selectedDate: string;
  onComplete?: (mealName: string) => void;
}

// Mapeo amigable de grupos de intercambio
const FRIENDLY_NAMES: Record<string, string> = {
  'cereales_altos_cho_bajos_grasas': 'Cereales (Altos en carbohidratos)',
  'cereales_medios_cho_bajos_grasas': 'Cereales integrales',
  'cereales_medios_cho_medios_grasas': 'Cereales y grasas',
  'lacteos_enteros': 'Lácteos (Enteros)',
  'lacteos_descremados_bajos_grasas': 'Lácteos (Descremados)',
  'vegetales_bajos_cho': 'Vegetales Frescos',
  'vegetales_libre': 'Vegetales de libre consumo',
  'frutas_medias_cho': 'Frutas Enteras',
  'frutas_bajas_cho': 'Frutas (Bajas en azúcar)',
  'carnes_bajas_grasas': 'Carnes magras / Proteína',
  'carnes_medias_grasas': 'Carnes regulares / Huevos',
  'leguminosas': 'Frijoles / Lentejas',
  'grasas_altas_grasas': 'Grasas saludables',
  'grasas_medias_grasas': 'Grasas con proteína',
  'azucares': 'Azúcares simples',
};

// Helper formatters
function formatAmount(amount: number): string {
  const eps = 0.05;
  if (Math.abs(amount - Math.round(amount)) < eps) return Math.round(amount).toString();
  if (Math.abs(amount - 0.25) < eps) return '1/4';
  if (Math.abs(amount - 0.5) < eps) return '1/2';
  if (Math.abs(amount - 0.75) < eps) return '3/4';
  if (Math.abs(amount - 0.33) < eps) return '1/3';
  if (Math.abs(amount - 0.66) < eps) return '2/3';
  if (Math.abs(amount - 1.5) < eps) return '1 1/2';
  if (Math.abs(amount - 2.5) < eps) return '2 1/2';
  if (Math.abs(amount - 1.33) < eps) return '1 1/3';
  if (Math.abs(amount - 1.66) < eps) return '1 2/3';
  return amount.toFixed(1).replace(/\.0$/, '');
}

function formatUnit(unit: string, amount: number): string {
  if (amount <= 1) {
    if (unit === 'tazas') return 'taza';
    if (unit === 'piezas') return 'pieza';
    if (unit === 'rebanadas') return 'rebanada';
    if (unit === 'cdas') return 'cda';
  } else {
    if (unit === 'taza') return 'tazas';
    if (unit === 'pieza') return 'piezas';
    if (unit === 'rebanada') return 'rebanadas';
    if (unit === 'cda') return 'cdas';
  }
  return unit;
}

interface FoodExample {
  amount: number;
  unit: string;
  food: string;
  isFree?: boolean;
}

const getFoodExamples = (restricciones: string[] = []): Record<string, FoodExample[]> => {
  const isBlanda = restricciones.includes('dieta_blanda');
  const sinLactosa = restricciones.includes('sin_lactosa');
  const sinVitK = restricciones.includes('sin_vitamina_k');

  return {
    'cereales_altos_cho_bajos_grasas': isBlanda
      ? [{ amount: 0.5, unit: 'taza', food: 'pasta cocida muy suave' }, { amount: 0.5, unit: 'taza', food: 'arroz blanco' }, { amount: 0.5, unit: 'taza', food: 'puré de papa' }]
      : [{ amount: 0.5, unit: 'taza', food: 'pasta' }, { amount: 0.5, unit: 'taza', food: 'arroz' }, { amount: 1, unit: 'taza', food: 'amaranto' }],
    'cereales_medios_cho_bajos_grasas': isBlanda
      ? [{ amount: 0.5, unit: 'taza', food: 'avena bien cocida' }, { amount: 1, unit: 'rebanada', food: 'pan blanco sin corteza' }, { amount: 1, unit: 'pieza', food: 'tortilla de maíz suave' }]
      : [{ amount: 1, unit: 'rebanada', food: 'pan integral' }, { amount: 0.5, unit: 'taza', food: 'avena' }, { amount: 1, unit: 'pieza', food: 'tortilla de maíz' }],
    'cereales_medios_cho_medios_grasas': [
      { amount: 0.5, unit: 'pieza', food: 'tamal pequeño' }, { amount: 3, unit: 'piezas', food: 'galletas con chispas' }, { amount: 1, unit: 'rebanada', food: 'pan dulce pequeño' }
    ],
    'lacteos_enteros': sinLactosa
      ? [{ amount: 1, unit: 'taza', food: 'leche de almendras fortificada' }, { amount: 1, unit: 'taza', food: 'yogur deslactosado' }, { amount: 1, unit: 'taza', food: 'leche de soya' }]
      : [{ amount: 1, unit: 'taza', food: 'leche entera' }, { amount: 1, unit: 'pieza', food: 'yogur natural' }, { amount: 1, unit: 'vaso', food: 'kéfir' }],
    'lacteos_descremados_bajos_grasas': sinLactosa
      ? [{ amount: 1, unit: 'taza', food: 'leche light deslactosada' }, { amount: 1, unit: 'taza', food: 'yogur deslactosado light' }, { amount: 1, unit: 'taza', food: 'leche de almendras sin azúcar' }]
      : [{ amount: 1, unit: 'taza', food: 'yogur griego sin grasa' }, { amount: 1, unit: 'taza', food: 'leche descremada' }, { amount: 1, unit: 'taza', food: 'kéfir bajo en grasa' }],
    'vegetales_bajos_cho': sinVitK
      ? [{ amount: 1, unit: 'taza', food: 'chayote o pimientos' }, { amount: 1, unit: 'taza', food: 'zanahoria rallada' }, { amount: 1, unit: 'taza', food: 'pepino picado' }]
      : isBlanda
        ? [{ amount: 1, unit: 'taza', food: 'puré de calabacita o zanahoria' }, { amount: 1, unit: 'taza', food: 'chayote cocido suave' }, { amount: 1, unit: 'taza', food: 'ejotes bien cocidos' }]
        : [{ amount: 1, unit: 'taza', food: 'espinacas cocidas' }, { amount: 2, unit: 'tazas', food: 'lechuga' }, { amount: 1, unit: 'taza', food: 'brócoli al vapor' }],
    'vegetales_libre': [{ amount: 1, unit: '', food: 'Pepino, jícama, apio o lechuga al gusto', isFree: true }, { amount: 1, unit: '', food: 'Tomate y cebolla al gusto', isFree: true }, { amount: 1, unit: '', food: 'Champiñones crudos al gusto', isFree: true }],
    'frutas_medias_cho': isBlanda
      ? [{ amount: 1, unit: 'taza', food: 'compota de manzana' }, { amount: 1, unit: 'taza', food: 'puré de pera' }, { amount: 0.5, unit: 'pieza', food: 'plátano maduro' }]
      : [{ amount: 1, unit: 'pieza', food: 'manzana' }, { amount: 0.5, unit: 'pieza', food: 'plátano' }, { amount: 1, unit: 'taza', food: 'papaya picada' }],
    'frutas_bajas_cho': isBlanda
      ? [{ amount: 0.5, unit: 'vaso', food: 'jugo de naranja diluido' }, { amount: 1, unit: 'taza', food: 'puré de fresa colado' }, { amount: 0.5, unit: 'vaso', food: 'jugo de toronja colado' }]
      : [{ amount: 1, unit: 'taza', food: 'fresas' }, { amount: 1, unit: 'taza', food: 'sandía' }, { amount: 1, unit: 'pieza', food: 'toronja' }],
    'carnes_bajas_grasas': isBlanda
      ? [{ amount: 30, unit: 'g', food: 'pollo desmenuzado hervido' }, { amount: 40, unit: 'g', food: 'queso panela suave' }, { amount: 30, unit: 'g', food: 'pescado blanco al vapor' }]
      : [{ amount: 40, unit: 'g', food: 'queso panela' }, { amount: 2, unit: 'rebanadas', food: 'pechuga de pavo' }, { amount: 30, unit: 'g', food: 'lomo de res magro' }],
    'carnes_medias_grasas': isBlanda
      ? [{ amount: 0.5, unit: 'taza', food: 'puré de pollo o pescado' }, { amount: 1, unit: 'pieza', food: 'huevo revuelto suave' }, { amount: 30, unit: 'g', food: 'carne molida de res magra' }]
      : [{ amount: 30, unit: 'g', food: 'pechuga de pollo' }, { amount: 30, unit: 'g', food: 'filete de pescado' }, { amount: 1, unit: 'pieza', food: 'huevo' }],
    'leguminosas': isBlanda
      ? [{ amount: 0.5, unit: 'taza', food: 'frijoles refritos muy suaves' }, { amount: 0.5, unit: 'taza', food: 'crema de lentejas colada' }, { amount: 0.5, unit: 'taza', food: 'puré de garbanzo (hummus suave)' }]
      : [{ amount: 0.5, unit: 'taza', food: 'frijoles de la olla' }, { amount: 0.5, unit: 'taza', food: 'lentejas' }, { amount: 0.5, unit: 'taza', food: 'garbanzos' }],
    'grasas_altas_grasas': [{ amount: 0.33, unit: 'pieza', food: 'aguacate mediano' }, { amount: 1, unit: 'cda', food: 'aceite de oliva' }, { amount: 3, unit: 'mitades', food: 'nuez' }],
    'grasas_medias_grasas': isBlanda
      ? [{ amount: 1, unit: 'cda', food: 'crema de cacahuate suave' }, { amount: 1, unit: 'cda', food: 'crema de almendras suave' }, { amount: 0.5, unit: 'pieza', food: 'aguacate hecho puré' }]
      : [{ amount: 10, unit: 'piezas', food: 'almendras' }, { amount: 14, unit: 'piezas', food: 'cacahuates tostados' }, { amount: 1, unit: 'cda', food: 'crema de cacahuate' }],
    'azucares': [{ amount: 1, unit: 'cda', food: 'miel de abeja' }, { amount: 1, unit: 'cda', food: 'mermelada' }, { amount: 1, unit: 'cda', food: 'azúcar estándar' }],
  };
};

function ExchangeItem({ racion, restricciones }: { racion: MenuRacion; restricciones: string[]; }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const record = getSmaeRecord(racion.smae_id);

  if (!record) return null;

  const friendlyName = FRIENDLY_NAMES[record.id] || record.subcategoria;
  const foodExamples = getFoodExamples(restricciones)[record.id];

  const totalCho = (record.cho * racion.cantidad).toFixed(1);
  const totalProt = (record.prot * racion.cantidad).toFixed(1);
  const totalGras = (record.grasas * racion.cantidad).toFixed(1);
  const totalKcal = Math.round((record.cho * 4 + record.prot * 4 + record.grasas * 9) * racion.cantidad);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-between p-2.5 border-b border-border/40 hover:bg-bg-elevated transition-colors cursor-pointer text-left last:border-0"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-salud-blue opacity-70"></span>
          <p className="font-medium text-text-primary text-sm">{friendlyName}</p>
        </div>
        <p className="text-xs font-bold text-salud-blue bg-salud-blue-soft/20 px-2 py-0.5 rounded-md">
          {racion.cantidad} {racion.cantidad === 1 ? 'ración' : 'raciones'}
        </p>
      </button>

      {/* Modal de Equivalencias */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Opciones de ${friendlyName}`}>
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Equivale a <strong className="text-text-primary">{racion.cantidad} {racion.cantidad === 1 ? 'ración' : 'raciones'}</strong>. Puedes elegir <span className="font-bold text-salud-blue">UNA</span> de las siguientes opciones para cumplir con tu plan:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {foodExamples && foodExamples.length > 0 ? foodExamples.map((ex, i) => {
              if (ex.isFree) {
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-bg-primary border border-border/60 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-salud-green-soft flex items-center justify-center text-salud-green shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="text-sm font-bold text-text-primary leading-tight">{ex.food}</span>
                  </div>
                );
              }
              const calcAmount = ex.amount * racion.cantidad;
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-white border border-border/60 rounded-xl shadow-sm hover:border-salud-blue/30 transition-colors">
                  <div className="flex flex-col items-center justify-center bg-bg-primary px-3 py-1.5 rounded-lg border border-border/40 min-w-[3.5rem]">
                    <span className="text-base font-extrabold text-salud-blue leading-none">{formatAmount(calcAmount)}</span>
                    <span className="text-[10px] font-bold text-text-secondary uppercase mt-0.5">{formatUnit(ex.unit, calcAmount)}</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary capitalize leading-tight">{ex.food}</span>
                </div>
              );
            }) : (
              <div className="col-span-full bg-bg-elevated rounded-[var(--radius-md)] p-4 text-center border border-border/40">
                <p className="text-sm text-text-secondary font-medium">Consulta a tu nutriólogo para ver ejemplos específicos de esta categoría.</p>
              </div>
            )}
          </div>

          <div className="bg-bg-elevated p-3 rounded-xl border border-border/40 mt-4">
             <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider mb-2">Aporte Nutricional Total</p>
             <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-salud-amber"></span><span className="font-bold text-text-primary">{totalCho}g Carbo</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-salud-blue"></span><span className="font-bold text-text-primary">{totalProt}g Prot</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-salud-red"></span><span className="font-bold text-text-primary">{totalGras}g Grasa</span></div>
             </div>
             <p className="mt-2 text-base font-extrabold text-text-primary flex items-center justify-between">
                <span>Total Calorías</span>
                <span className="text-salud-blue">{totalKcal} kcal</span>
             </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

function MealSection({ meal, restricciones, delay, selectedDate, onComplete }: MealSectionProps) {
  const { state, dispatch } = usePatient();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRaciones, setSelectedRaciones] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const logActual = state.diario?.[selectedDate]?.comidasRegistradas?.[meal.nombre];
  const isCompleted = !!logActual;

  const handleOpenModal = () => {
    if (isCompleted) return;
    setSelectedRaciones(meal.raciones.map(r => r.smae_id));
    setIsOpen(true);
  };

  const handleToggleRacion = (id: string) => {
    setSelectedRaciones(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedRaciones(meal.raciones.map(r => r.smae_id));
  };

  const handleSaveMeal = () => {
    dispatch({
      type: 'LOG_MEAL',
      payload: {
        fecha: selectedDate,
        mealName: meal.nombre,
        raciones: selectedRaciones
      }
    });
    setIsOpen(false);
    if (onComplete) {
      setTimeout(() => onComplete(meal.nombre), 300);
    }
  };

  const spanishVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const pickBestSpanishVoice = useCallback(() => {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    
    const VOICE_PRIORITY = ['es-US', 'es-MX', 'es-CO', 'es-AR', 'es-ES'];

    const premiumVoices = voices.filter(v =>
      v.lang.startsWith('es') &&
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Sabina') || v.name.includes('Elena') || v.name.includes('Premium'))
    );
    if (premiumVoices.length > 0) return premiumVoices[0];

    for (const lang of VOICE_PRIORITY) {
      const match = voices.find((v) => v.lang === lang);
      if (match) return match;
    }

    return voices.find((v) => v.lang.startsWith('es')) ?? null;
  }, []);

  useEffect(() => {
    const load = () => {
      spanishVoiceRef.current = pickBestSpanishVoice();
    };
    load();
    window.speechSynthesis?.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load);
  }, [pickBestSpanishVoice]);

  const handleSpeak = useCallback(() => {
    if (!window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const numItems = meal.raciones.length;
    let text = `Para tu ${meal.nombre.toLowerCase()}, te sugerimos lo siguiente. `;

    meal.raciones.forEach((racion, index) => {
      const record = getSmaeRecord(racion.smae_id);
      if (!record) return;

      const friendlyName = FRIENDLY_NAMES[record.id] || record.subcategoria;
      const foodExamples = getFoodExamples(restricciones)[record.id];
      let exampleForSpeech = '';
      if (foodExamples && foodExamples.length > 0) {
        const ex = foodExamples[0];
        if (ex.isFree) {
          exampleForSpeech = `Como por ejemplo: ${ex.food}`;
        } else {
          const calcAmount = ex.amount * racion.cantidad;
          exampleForSpeech = `Como por ejemplo: ${formatAmount(calcAmount)} ${formatUnit(ex.unit, calcAmount)} de ${ex.food}`;
        }
      }

      let connector: string;
      if (index === 0) connector = 'Primero, tienes';
      else if (index === numItems - 1) connector = 'Y por último,';
      else connector = 'Además,';

      const racionesText = racion.cantidad === 1 ? '1 ración' : `${racion.cantidad} raciones`;
      text += `${connector} ${racionesText} de ${friendlyName}. ${exampleForSpeech}. `;
    });

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    if (spanishVoiceRef.current) {
      utterance.voice = spanishVoiceRef.current;
      utterance.lang = spanishVoiceRef.current.lang;
    }

    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, [isPlaying, meal.nombre, meal.raciones, restricciones]);

  if (meal.raciones.length === 0) return null;

  return (
    <div className={`${delay} animate-fade-in`}>
      <Card padding="md">
        {/* Meal Header with Integrated CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenModal}
              disabled={isCompleted}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${isCompleted ? 'bg-salud-green border-salud-green text-white cursor-default' : 'border-border text-transparent hover:border-salud-green/50 cursor-pointer'
                }`}
              aria-label={`Registrar ${meal.nombre}`}
            >
              <CheckCircle2 size={16} className={isCompleted ? "opacity-100" : "opacity-0"} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-secondary">{meal.horario}</span>
                {isCompleted && (
                  <span className="bg-salud-green-soft/30 text-salud-green text-[10px] border border-salud-green/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Completado
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeak}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${isPlaying
                  ? 'text-salud-red bg-salud-red-soft hover:bg-salud-red/20'
                  : 'text-text-secondary bg-bg-elevated hover:bg-border/50 hover:text-text-primary'
                }`}
              aria-label={isPlaying ? "Detener voz" : "Escuchar menú en voz alta"}
            >
              {isPlaying ? <Square size={18} fill="currentColor" /> : <Volume2 size={18} />}
            </button>
            <button
              onClick={() => {
                const catMap: Record<string, string> = {
                  'Desayuno': 'desayuno', 'Almuerzo': 'almuerzo', 'Cena': 'cena',
                  'Colación 1': 'colacion', 'Colación 2': 'colacion'
                };
                const cat = catMap[meal.nombre] || 'almuerzo';
                navigate(`/recetas?categoria=${cat}`);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-salud-blue/30 bg-salud-blue-soft/10 text-salud-blue text-xs font-bold hover:bg-salud-blue-soft/20 transition-colors shadow-sm"
            >
              <ChefHat size={16} />
              Ver opciones de menú
            </button>
          </div>
        </div>

        {/* Exchange List */}
        <div className="flex flex-col">
          {meal.raciones.map((racion, idx) => (
            <ExchangeItem
              key={`${racion.smae_id}-${idx}`}
              racion={racion}
              restricciones={restricciones}
            />
          ))}
        </div>

        {/* MODAL DE ADHERENCIA */}
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Registrar ${meal.nombre}`}>
          <p className="text-sm text-text-secondary mb-4">
            Selecciona las raciones que realmente consumiste para llevar un registro preciso.
          </p>

          <div className="space-y-2 mb-6">
            {meal.raciones.map((racion) => {
              const record = getSmaeRecord(racion.smae_id);
              if (!record) return null;
              const isSelected = selectedRaciones.includes(racion.smae_id);
              const friendlyName = FRIENDLY_NAMES[record.id] || record.subcategoria;

              return (
                <div
                  key={racion.smae_id}
                  onClick={() => handleToggleRacion(racion.smae_id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${isSelected ? 'bg-salud-green/10 border-salud-green text-text-primary' : 'bg-bg-elevated border-border/40 text-text-secondary hover:border-border'
                    }`}
                >
                  {isSelected ? <CheckSquare className="text-salud-green" /> : <Square className="text-text-tertiary" />}
                  <div>
                    <p className="font-bold">{friendlyName}</p>
                    <p className="text-xs opacity-80">{racion.cantidad} raciones</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4 border-t border-border/50">
            <Button variant="secondary" onClick={handleSelectAll} fullWidth>
              Comí Todo
            </Button>
            <Button variant="primary" onClick={handleSaveMeal} fullWidth>
              Guardar Registro
            </Button>
          </div>
        </Modal>
      </Card>
    </div>
  );
}

export default function Menu() {
  const { state } = usePatient();
  const { resultados } = state;
  // Tab state
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const selectedDate = new Date().toISOString().split('T')[0];

  if (!resultados) {
    return <EmptyPatientState />;
  }

  const asignacion = asignarPlantillaOptima(resultados.get);
  const template = asignacion.plantilla;

  evaluateMenu(template.id, {
    cho: resultados.macros.carbohidratos.gramos,
    prot: resultados.macros.proteinas.gramos,
    grasas: resultados.macros.grasas.gramos,
    kcal: resultados.macros.totalKcal,
  });

  // Auto-select first uncompleted meal or fallback to time-based
  const activeMealName = activeTab || (() => {
    const logDiario = state.diario?.[selectedDate]?.comidasRegistradas || {};
    const uncompleted = template?.tiempos.find(m => !logDiario[m.nombre]);
    
    if (uncompleted) return uncompleted.nombre;

    const hour = new Date().getHours();
    if (hour < 11) return 'Desayuno';
    if (hour < 13) return 'Colación 1';
    if (hour < 16) return 'Almuerzo';
    if (hour < 19) return 'Colación 2';
    return 'Cena';
  })();

  const activeMealData = template?.tiempos.find(m => m.nombre === activeMealName) || template?.tiempos[0];

  const handleMealComplete = (completedMealName: string) => {
    const logDiario = state.diario?.[selectedDate]?.comidasRegistradas || {};
    const uncompleted = template?.tiempos.find(m => 
      m.nombre !== completedMealName && 
      !logDiario[m.nombre]
    );
    if (uncompleted) {
      setActiveTab(uncompleted.nombre);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Module Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2">
          <UtensilsCrossed size={24} className="text-salud-green" />
          Menú del Día
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Plan nutricional 100% balanceado y personalizado
        </p>
      </div>

      {/* Macro distribution overview */}
      <Card padding="sm">
        <h2 className="text-sm font-bold text-text-primary mb-2">
          Tus Macronutrientes de Hoy
        </h2>
        <MacroChart
          proteinas={resultados.macros.proteinas}
          grasas={resultados.macros.grasas}
          carbohidratos={resultados.macros.carbohidratos}
          totalKcal={resultados.macros.totalKcal}
        />
        <div className="mt-3 p-2.5 rounded-lg bg-bg-elevated/60 border border-border/50 text-xs text-text-secondary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">ℹ️</span>
            <span>
              <strong className="text-text-primary">Cálculo de Calorías por Gramo:</strong> 1g Proteína = <span className="text-salud-blue font-bold">4 kcal</span> · 1g Carbohidrato = <span className="text-salud-green font-bold">4 kcal</span> · 1g Grasa = <span className="text-salud-amber font-bold">9 kcal</span>.
            </span>
          </div>
        </div>
      </Card>

      {/* Meal Navigation */}
      <div className="flex items-center justify-between bg-bg-card border border-border/40 rounded-full p-1 shadow-sm mt-2">
        <button
          onClick={() => {
            const idx = template?.tiempos.findIndex(m => m.nombre === activeMealData?.nombre) ?? 0;
            if (idx > 0 && template) {
              setActiveTab(template.tiempos[idx - 1].nombre);
            }
          }}
          disabled={!template || template.tiempos.findIndex(m => m.nombre === activeMealData?.nombre) === 0}
          className="p-2 text-text-secondary hover:text-salud-blue disabled:opacity-30 disabled:hover:text-text-secondary rounded-full transition-colors cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-bold text-sm text-text-primary uppercase tracking-wider">
          {activeMealData?.nombre}
        </span>
        <button
          onClick={() => {
            const idx = template?.tiempos.findIndex(m => m.nombre === activeMealData?.nombre) ?? 0;
            if (template && idx < template.tiempos.length - 1) {
              setActiveTab(template.tiempos[idx + 1].nombre);
            }
          }}
          disabled={!template || template.tiempos.findIndex(m => m.nombre === activeMealData?.nombre) === (template.tiempos.length - 1)}
          className="p-2 text-text-secondary hover:text-salud-blue disabled:opacity-30 disabled:hover:text-text-secondary rounded-full transition-colors cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      {/* Active Meal Section */}
      {activeMealData && (
        <MealSection
          meal={activeMealData}
          restricciones={resultados.restriccionesMenu || []}
          selectedDate={selectedDate}
          onComplete={handleMealComplete}
        />
      )}
    </div>
  );
}
