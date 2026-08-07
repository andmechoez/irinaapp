import { useState, useEffect, useContext } from 'react';
import { Sparkles, Plus, X, ChefHat, HeartPulse, ShoppingCart, RefreshCw, Save, Flame, Clock, Check } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { PatientContext } from '../../contexts/PatientContext';
import { useRecipeStore } from '../../store/useRecipeStore';
import { generarRecetaIA } from '../../services/aiService';
import RecetaSkeletonLoader from './RecetaSkeletonLoader';
import type { Receta, CategoriaReceta } from '../../types';
import { CATEGORIAS_RECETA, getCategoriaEmoji, getCategoriaLabel } from '../../utils/recetaEngine';
import { supabase } from '../../lib/supabase';

const PATOLOGIAS_COMUNES = [
  { id: 'Diabetes', label: 'Diabetes / Glucosa Alta', color: 'bg-salud-amber-soft text-salud-amber border-salud-amber/50' },
  { id: 'Hipertensión', label: 'Hipertensión Arterial', color: 'bg-salud-red-soft text-salud-red border-salud-red/50' },
  { id: 'Enfermedad Renal', label: 'Enfermedad Renal', color: 'bg-purple-500/10 text-purple-600 border-purple-500/50' },
  { id: 'Obesidad', label: 'Control de Peso / Obesidad', color: 'bg-salud-blue-soft text-salud-blue border-salud-blue/50' },
  { id: 'Dislipidemia', label: 'Colesterol / Triglicéridos', color: 'bg-salud-green-soft text-salud-green border-salud-green/50' },
  { id: 'Gastritis', label: 'Gastritis / Reflujo', color: 'bg-orange-500/10 text-orange-600 border-orange-500/50' },
];

const INGREDIENTES_SUGERIDOS = {
  '🍗 Proteínas': ['Pollo de corral', 'Salmón fresco', 'Atún en agua', 'Huevo entero', 'Claras de huevo', 'Queso panela', 'Yogur griego sin azúcar', 'Tofu orgánico', 'Carne magra de res'],
  '🌾 Carbohidratos y Fibra': ['Avena en hojuelas', 'Arroz integral', 'Quinoa tricolor', 'Camote asado', 'Tortilla de maíz', 'Pan integral de masa madre', 'Lentejas cocidas', 'Garbanzos'],
  '🥦 Vegetales y Frutas': ['Espinaca fresca', 'Brócoli', 'Calabacita italiana', 'Zanahoria', 'Jitomate salaette', 'Aguacate hass', 'Manzana verde', 'Plátano maduro', 'Fresas frescas', 'Arándanos'],
  '🥑 Grasas y Semillas': ['Nueces pecana', 'Almendras naturales', 'Semillas de chía', 'Linaza molida', 'Aceite de oliva extra virgen', 'Crema de cacahuate natural'],
};

interface GeneradorIAProps {
  onRecipeSaved?: () => void;
}

export default function GeneradorIA({ onRecipeSaved }: GeneradorIAProps) {
  const patientCtx = useContext(PatientContext);
  const evaluacion = patientCtx?.state?.evaluacion || null;
  const { addGeneratedRecipe } = useRecipeStore();

  // Estados del formulario
  const [patologíasSeleccionadas, setPatologíasSeleccionadas] = useState<string[]>([]);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<string[]>([]);
  const [ingredientePersonalizado, setIngredientePersonalizado] = useState('');
  const [categoria, setCategoria] = useState<CategoriaReceta>('almuerzo');
  const [calorias, setCalorias] = useState<number>(450);
  const [instrucciones, setInstrucciones] = useState('');

  // Estados de generación y vista
  const [loading, setLoading] = useState(false);
  const [recetaGenerada, setRecetaGenerada] = useState<Receta | null>(null);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // Pre-cargar condiciones clínicas del paciente
  useEffect(() => {
    if (evaluacion?.condiciones && evaluacion.condiciones.length > 0) {
      const conds = evaluacion.condiciones.filter((c) => c !== 'ninguno');
      if (conds.length > 0) {
        setPatologíasSeleccionadas(conds);
      }
    }
  }, [evaluacion]);

  const handleTogglePatologia = (id: string) => {
    setPatologíasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleToggleIngrediente = (nombre: string) => {
    setIngredientesSeleccionados((prev) =>
      prev.includes(nombre) ? prev.filter((i) => i !== nombre) : [...prev, nombre]
    );
  };

  const handleAddCustomIngrediente = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ingredientePersonalizado.trim()) return;
    const clean = ingredientePersonalizado.trim();
    if (!ingredientesSeleccionados.includes(clean)) {
      setIngredientesSeleccionados((prev) => [...prev, clean]);
    }
    setIngredientePersonalizado('');
  };

  const handleGenerar = async () => {
    if (ingredientesSeleccionados.length === 0) {
      alert('Por favor selecciona o escribe al menos un ingrediente para generar la receta.');
      return;
    }

    setLoading(true);
    setRecetaGenerada(null);
    setGuardadoExitoso(false);

    try {
      const receta = await generarRecetaIA({
        ingredientes: ingredientesSeleccionados,
        patologías: patologíasSeleccionadas,
        categoria,
        caloriasObjetivo: calorias,
        instruccionesAdicionales: instrucciones,
      });
      setRecetaGenerada(receta);
    } catch (error) {
      console.error('Error generando receta IA:', error);
      alert('Ocurrió un error al generar la receta. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!recetaGenerada) return;
    
    // Guardar en la tienda local
    addGeneratedRecipe(recetaGenerada);

    // Guardar en la base de datos Supabase
    try {
      const dbRecipe = {
        nombre: recetaGenerada.nombre,
        descripcion: recetaGenerada.descripcion || '',
        categoria: recetaGenerada.categoria || categoria,
        dificultad: recetaGenerada.dificultad || 'media',
        tiempo_preparacion_min: recetaGenerada.tiempo_preparacion_min || recetaGenerada.tiempoPreparacionMin || 25,
        porciones_rinde: recetaGenerada.porciones_rinde || recetaGenerada.porcionesRinde || 1,
        ingredientes: recetaGenerada.ingredientes || [],
        instrucciones: recetaGenerada.instrucciones || [],
        origen: 'ia',
        macros_por_porcion: recetaGenerada.macros_por_porcion || recetaGenerada.macrosPorPorcion || { kcal: 0, prot: 0, cho: 0, grasas: 0 },
        datos_nutricionales_avanzados: recetaGenerada.datos_nutricionales_avanzados || {},
        apta_para_condiciones: recetaGenerada.apta_para_condiciones || recetaGenerada.aptaParaCondiciones || [],
        restricciones: recetaGenerada.restricciones || [],
        tags: recetaGenerada.tags || ['IA'],
      };

      const { error } = await supabase.from('recipes').insert(dbRecipe);
      if (error) {
        console.error('Error guardando receta de IA en Supabase:', error);
      }
    } catch (err) {
      console.error('Excepción al guardar en BD:', err);
    }

    setGuardadoExitoso(true);
    setTimeout(() => {
      if (onRecipeSaved) {
        onRecipeSaved();
      }
    }, 1200);
  };

  if (loading) {
    return <RecetaSkeletonLoader />;
  }

  // Previsualización de receta generada
  if (recetaGenerada) {
    const macros = recetaGenerada.macros_por_porcion || recetaGenerada.macrosPorPorcion || { kcal: 0, prot: 0, cho: 0, grasas: 0 };
    const tiempo = recetaGenerada.tiempo_preparacion_min || recetaGenerada.tiempoPreparacionMin || 25;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between bg-gradient-to-r from-salud-blue-soft/30 via-salud-green-soft/20 to-bg-card p-4 rounded-[var(--radius-lg)] border border-salud-blue/30">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <div>
              <p className="text-sm font-extrabold text-text-primary">¡Menú Clínico IA Listo!</p>
              <p className="text-xs text-text-secondary">Creado a medida por Gemini 2.5 Flash Lite para {evaluacion?.nombre || 'el paciente'}</p>
            </div>
          </div>
          <button
            onClick={() => setRecetaGenerada(null)}
            className="px-3 py-1.5 rounded-[var(--radius-sm)] bg-bg-elevated text-text-secondary hover:text-text-primary text-xs font-bold transition-colors cursor-pointer"
          >
            ← Volver a editar
          </button>
        </div>

        <Card padding="lg" className="border-2 border-salud-blue/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-salud-blue text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-lg uppercase tracking-wider flex items-center gap-1 shadow">
            <Sparkles size={12} /> Generada por IA
          </div>

          <div className="mb-4 pr-24">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-salud-blue bg-salud-blue-soft px-2.5 py-0.5 rounded-full">
                {getCategoriaEmoji(recetaGenerada.categoria)} {getCategoriaLabel(recetaGenerada.categoria)}
              </span>
              <span className="text-xs font-bold text-salud-green bg-salud-green-soft px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock size={12} /> {tiempo} min
              </span>
            </div>
            <h2 className="text-2xl font-black text-text-primary mb-1">{recetaGenerada.nombre}</h2>
            <p className="text-sm text-text-secondary">{recetaGenerada.descripcion}</p>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-4 gap-2 py-4 border-y border-border/40 my-6 bg-bg-elevated/40 rounded-xl p-3 text-center">
            <div>
              <p className="text-xl font-black text-salud-red flex items-center justify-center gap-1">
                <Flame size={16} /> {macros.kcal}
              </p>
              <p className="text-[10px] font-bold text-text-tertiary uppercase">Calorías</p>
            </div>
            <div>
              <p className="text-xl font-black text-salud-blue">{macros.prot}g</p>
              <p className="text-[10px] font-bold text-text-tertiary uppercase">Proteína</p>
            </div>
            <div>
              <p className="text-xl font-black text-salud-amber">{macros.cho}g</p>
              <p className="text-[10px] font-bold text-text-tertiary uppercase">Carbohidratos</p>
            </div>
            <div>
              <p className="text-xl font-black text-text-primary">{macros.grasas}g</p>
              <p className="text-[10px] font-bold text-text-tertiary uppercase">Grasas</p>
            </div>
          </div>

          {/* Condiciones clínicas */}
          {recetaGenerada.aptaParaCondiciones && recetaGenerada.aptaParaCondiciones.length > 0 && (
            <div className="mb-6 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-text-secondary flex items-center gap-1">
                <HeartPulse size={14} className="text-salud-red" /> Apto para:
              </span>
              {recetaGenerada.aptaParaCondiciones.map((cond, idx) => (
                <span key={idx} className="text-xs bg-salud-green-soft/60 text-salud-green font-bold px-2 py-0.5 rounded-md border border-salud-green/30">
                  ✓ {cond}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Ingredientes */}
            <div className="bg-bg-elevated/30 p-4 rounded-xl border border-border/30">
              <h3 className="text-sm font-extrabold text-text-primary mb-3 flex items-center gap-2">
                <ShoppingCart size={16} className="text-salud-blue" /> Ingredientes ({recetaGenerada.ingredientes?.length || 0})
              </h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                {(recetaGenerada.ingredientes || []).map((ing, i) => (
                  <li key={i} className="flex items-center justify-between border-b border-border/20 pb-1.5 last:border-0 last:pb-0">
                    <span className="font-medium text-text-primary">• {ing.nombre}</span>
                    <span className="text-xs font-bold text-salud-blue bg-salud-blue-soft/50 px-2 py-0.5 rounded">
                      {ing.cantidad} {ing.unidad} {ing.racionesSmae ? `(${ing.racionesSmae} ración SMAE)` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instrucciones */}
            <div className="bg-bg-elevated/30 p-4 rounded-xl border border-border/30">
              <h3 className="text-sm font-extrabold text-text-primary mb-3 flex items-center gap-2">
                <ChefHat size={16} className="text-salud-green" /> Procedimiento Paso a Paso
              </h3>
              <ol className="space-y-3 text-sm text-text-secondary">
                {(recetaGenerada.instrucciones || []).map((paso, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="font-black text-salud-green flex-shrink-0 w-5 h-5 rounded-full bg-salud-green-soft flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{paso}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Botones de acción final */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
            <button
              onClick={handleGuardar}
              disabled={guardadoExitoso}
              className={`flex-1 py-3 px-6 rounded-[var(--radius-lg)] font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                guardadoExitoso
                  ? 'bg-salud-green text-white cursor-default'
                  : 'bg-gradient-to-r from-salud-blue to-salud-green text-white hover:opacity-95 hover:shadow-lg'
              }`}
            >
              {guardadoExitoso ? (
                <>
                  <Check size={18} className="animate-bounce" /> ¡Guardada en tu Recetario!
                </>
              ) : (
                <>
                  <Save size={18} /> Guardar en mi Recetario ✨
                </>
              )}
            </button>

            <button
              onClick={handleGenerar}
              disabled={guardadoExitoso}
              className="px-6 py-3 rounded-[var(--radius-lg)] border-2 border-border bg-bg-card text-text-secondary hover:border-salud-blue/50 hover:text-text-primary font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw size={18} /> Regenerar propuesta
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Vista principal del generador de recetas
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-salud-blue-soft/30 via-salud-green-soft/20 to-bg-card p-5 rounded-[var(--radius-lg)] border border-salud-blue/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
            <Sparkles size={22} className="text-salud-blue" />
            Motor IA Clínico de Recetas
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Gemini 2.5 Flash diseña un menú adaptado a las condiciones médicas y la alacena de {evaluacion?.nombre || 'tu paciente'}.
          </p>
        </div>
        {evaluacion && (
          <div className="bg-bg-card px-3 py-2 rounded-[var(--radius-md)] border border-border/60 text-right flex-shrink-0">
            <p className="text-[10px] font-bold text-text-tertiary uppercase">Paciente en Consulta</p>
            <p className="text-xs font-black text-salud-blue">{evaluacion.nombre} ({evaluacion.objetivo})</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Patologías y Preferencias */}
        <div className="space-y-6 lg:col-span-1">
          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-1.5">
                <HeartPulse size={16} className="text-salud-red" />
                1. Patologías y Contraindicaciones
              </h3>
            </div>
            <p className="text-xs text-text-tertiary">
              Selecciona las condiciones que Gemini debe respetar para prohibir ingredientes nocivos:
            </p>

            <div className="flex flex-wrap gap-2">
              {PATOLOGIAS_COMUNES.map((pat) => {
                const activa = patologíasSeleccionadas.includes(pat.id);
                return (
                  <button
                    key={pat.id}
                    onClick={() => handleTogglePatologia(pat.id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                      activa
                        ? pat.color + ' shadow-sm scale-[1.02]'
                        : 'bg-bg-elevated border-border text-text-secondary hover:border-salud-blue/30'
                    }`}
                  >
                    {activa ? '✓' : '+'} {pat.label}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-1.5">
              <ChefHat size={16} className="text-salud-green" />
              2. Parámetros del Plato
            </h3>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Categoría de comida:</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaReceta)}
                className="w-full h-[40px] px-3 rounded-[var(--radius-md)] border border-border bg-bg-card text-text-primary text-sm font-medium focus:border-salud-blue outline-none"
              >
                {CATEGORIAS_RECETA.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-text-secondary">Calorías objetivo:</span>
                <span className="text-salud-red">{calorias} kcal</span>
              </div>
              <input
                type="range"
                min={200}
                max={900}
                step={50}
                value={calorias}
                onChange={(e) => setCalorias(Number(e.target.value))}
                className="w-full accent-salud-red cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-tertiary mt-1">
                <span>200 kcal (Ligeras)</span>
                <span>500 kcal (Estándar)</span>
                <span>900 kcal (Abundantes)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5">Instrucciones o preferencias opcionales:</label>
              <textarea
                rows={2}
                placeholder="Ej: Preparación rápida en sartén en menos de 15 min, sin picante..."
                value={instrucciones}
                onChange={(e) => setInstrucciones(e.target.value)}
                className="w-full p-2.5 rounded-[var(--radius-md)] border border-border bg-bg-card text-text-primary text-xs font-medium focus:border-salud-blue outline-none resize-none"
              ></textarea>
            </div>
          </Card>
        </div>

        {/* Columna Derecha: Alacena de Ingredientes */}
        <div className="space-y-6 lg:col-span-2">
          <Card padding="md" className="space-y-4 border-salud-blue/20">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-1.5">
                  <ShoppingCart size={18} className="text-salud-blue" />
                  3. Alacena e Ingredientes del Carrito ({ingredientesSeleccionados.length})
                </h3>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Haz clic para añadir los alimentos con los que cuentas en la cocina o dispensario:
                </p>
              </div>
              {ingredientesSeleccionados.length > 0 && (
                <button
                  onClick={() => setIngredientesSeleccionados([])}
                  className="text-xs text-salud-red font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X size={14} /> Vaciar carrito
                </button>
              )}
            </div>

            {/* Carrito activo */}
            <div className="min-h-[70px] bg-bg-elevated/50 p-3 rounded-xl border-2 border-dashed border-salud-blue/30 flex flex-wrap gap-2 items-center">
              {ingredientesSeleccionados.length === 0 ? (
                <p className="text-xs text-text-tertiary italic w-full text-center py-2">
                  👆 Tu carrito de ingredientes está vacío. Selecciona abajo o escribe los tuyos.
                </p>
              ) : (
                ingredientesSeleccionados.map((ing) => (
                  <span
                    key={ing}
                    className="bg-salud-blue text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm animate-fade-in"
                  >
                    {ing}
                    <button
                      onClick={() => handleToggleIngrediente(ing)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Añadir ingrediente personalizado */}
            <form onSubmit={handleAddCustomIngrediente} className="flex gap-2">
              <Input
                type="text"
                placeholder="Escribe otro ingrediente (ej. Champiñones, Acelgas...)"
                value={ingredientePersonalizado}
                onChange={(e) => setIngredientePersonalizado(e.target.value)}
                className="flex-1 text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-bg-elevated text-text-primary hover:bg-salud-blue hover:text-white rounded-[var(--radius-md)] border border-border/60 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Añadir
              </button>
            </form>

            {/* Categorías sugeridas */}
            <div className="space-y-4 pt-2">
              {Object.entries(INGREDIENTES_SUGERIDOS).map(([grupo, items]) => (
                <div key={grupo} className="space-y-1.5">
                  <p className="text-xs font-extrabold text-text-secondary">{grupo}:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item) => {
                      const seleccionado = ingredientesSeleccionados.includes(item);
                      return (
                        <button
                          key={item}
                          onClick={() => handleToggleIngrediente(item)}
                          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer border ${
                            seleccionado
                              ? 'bg-salud-blue-soft text-salud-blue border-salud-blue font-bold shadow-sm'
                              : 'bg-bg-card border-border/60 text-text-secondary hover:border-salud-blue/40 hover:text-text-primary'
                          }`}
                        >
                          {seleccionado ? '✓ ' : '+ '} {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Botón Principal Generar */}
          <button
            onClick={handleGenerar}
            disabled={ingredientesSeleccionados.length === 0}
            className={`w-full py-4 rounded-[var(--radius-lg)] font-black text-base flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer ${
              ingredientesSeleccionados.length === 0
                ? 'bg-border/60 text-text-tertiary cursor-not-allowed'
                : 'bg-gradient-to-r from-salud-blue via-salud-green to-salud-blue bg-[length:200%_100%] animate-gradient text-white hover:opacity-95 hover:shadow-xl hover:scale-[1.005]'
            }`}
          >
            <Sparkles size={20} className="animate-spin" style={{ animationDuration: '4s' }} />
            <span>Generar Menú Nutricional con Inteligencia Artificial ✨</span>
          </button>
        </div>
      </div>
    </div>
  );
}
