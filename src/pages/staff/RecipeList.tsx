import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Plus, Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { useRecipeStore } from '../../store/useRecipeStore';
import type { Receta, FiltrosReceta } from '../../types';
import { buscarRecetas } from '../../utils/recetaEngine';
import RecetaCard from '../../components/recipes/RecetaCard';
import RecetaDetalle from '../../components/recipes/RecetaDetalle';
import FiltrosAvanzados from '../../components/recipes/FiltrosAvanzados';
import GeneradorIA from '../../components/recipes/GeneradorIA';

export default function RecipeList() {
  const navigate = useNavigate();
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);
  const { generatedRecipes, removeGeneratedRecipe } = useRecipeStore();

  const [vistaActiva, setVistaActiva] = useState<'recetario' | 'ia'>('recetario');
  const [searchText, setSearchText] = useState('');
  const [filtros, setFiltros] = useState<FiltrosReceta>({});
  const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | null>(null);

  useEffect(() => {
    async function loadRecetas() {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setRecetas(data as unknown as Receta[]);
      }
      setLoading(false);
    }
    loadRecetas();

    const channel = supabase.channel('recipes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recipes' },
        () => {
          loadRecetas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const catalogoUnificado = useMemo(() => {
    const genIds = new Set(generatedRecipes.map(r => r.id));
    const sysFiltered = recetas.filter(r => !genIds.has(r.id));
    return [...generatedRecipes, ...sysFiltered];
  }, [generatedRecipes, recetas]);

  const filtrosActivos = useMemo(() => {
    let count = 0;
    if (filtros.condicionMedica) count++;
    if (filtros.dificultad) count++;
    if (filtros.rangoKcal) count++;
    if (filtros.tiempoMaxMin) count++;
    if (filtros.restricciones?.length) count += filtros.restricciones.length;
    if (filtros.tags?.length) count += filtros.tags.length;
    if (filtros.categoria) count++;
    if (filtros.cargaGlicemica) count++;
    if (filtros.dietaEspecial) count++;
    return count;
  }, [filtros]);

  const resultadosBusqueda = useMemo(() => {
    const filtrosCombinados: FiltrosReceta = {
      ...filtros,
      busqueda: searchText || undefined,
    };
    return buscarRecetas(filtrosCombinados, catalogoUnificado);
  }, [filtros, searchText, catalogoUnificado]);

  const handleDeleteRecipe = async (r: Receta) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar la receta "${r.nombre}"?`);
    if (!confirmDelete) return;

    if (r.origen === 'ia') {
      removeGeneratedRecipe(r.id);
    } else {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', r.id);

      if (error) {
        console.error('Error al eliminar la receta de la base de datos:', error.message);
        alert('No se pudo eliminar la receta: ' + error.message);
      } else {
        alert('Receta eliminada con éxito del catálogo.');
        setRecetas(prev => prev.filter(item => item.id !== r.id));
      }
    }
  };

  if (recetaSeleccionada) {
    return (
      <div className="space-y-6 animate-fade-in">
        <RecetaDetalle
          receta={recetaSeleccionada}
          onClose={() => setRecetaSeleccionada(null)}
          onDelete={() => {
            const selected = recetaSeleccionada;
            setRecetaSeleccionada(null);
            handleDeleteRecipe(selected);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2">
            <ChefHat className="text-salud-green" /> Gestión de Recetas
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Administra el catálogo y diseña menús clínicos con Inteligencia Artificial.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Selector de pestañas para administradores / nutricionistas */}
          <div className="flex bg-bg-card p-1 rounded-[var(--radius-lg)] border border-border/60 shadow-sm">
            <button
              onClick={() => { setVistaActiva('recetario'); setRecetaSeleccionada(null); }}
              className={`py-2 px-3 rounded-[var(--radius-md)] text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                vistaActiva === 'recetario'
                  ? 'bg-salud-blue text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              <ChefHat size={15} /> Catálogo ({catalogoUnificado.length})
            </button>
            <button
              onClick={() => { setVistaActiva('ia'); setRecetaSeleccionada(null); }}
              className={`py-2 px-3 rounded-[var(--radius-md)] text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                vistaActiva === 'ia'
                  ? 'bg-gradient-to-r from-salud-blue via-salud-green to-salud-blue bg-[length:200%_100%] animate-gradient text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              }`}
            >
              <Sparkles size={15} className="animate-pulse" /> Generador IA ✨
            </button>
          </div>

          <Button onClick={() => navigate('/staff/recetas/nueva')} icon={<Plus size={18} />}>
            Añadir Manual
          </Button>
        </div>
      </div>

      {vistaActiva === 'ia' ? (
        <GeneradorIA onRecipeSaved={() => { setVistaActiva('recetario'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
      ) : (
        <>
          <div className="flex gap-2 max-w-2xl">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Buscar por nombre, ingrediente..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                icon={<Search size={18} />}
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-text-tertiary hover:text-text-primary cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFiltrosAvanzados(true)}
              className={`px-3 py-2 rounded-[var(--radius-md)] border-2 transition-colors cursor-pointer relative ${
                filtrosActivos > 0
                  ? 'border-salud-blue bg-salud-blue-soft text-salud-blue'
                  : 'border-border bg-bg-card text-text-secondary hover:border-salud-blue/30'
              }`}
            >
              <SlidersHorizontal size={20} />
              {filtrosActivos > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-salud-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {filtrosActivos}
                </span>
              )}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-text-secondary">Cargando recetas...</div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-text-secondary">
                  {resultadosBusqueda.length} receta{resultadosBusqueda.length !== 1 ? 's' : ''} en el catálogo
                </p>
                {(searchText || filtrosActivos > 0) && (
                  <button
                    onClick={() => { setSearchText(''); setFiltros({}); }}
                    className="text-xs text-salud-blue font-bold cursor-pointer"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

              {resultadosBusqueda.length === 0 ? (
                <Card className="text-center py-12">
                  <p className="text-4xl mb-2">🔍</p>
                  <p className="text-text-secondary font-medium">No se encontraron recetas con estos filtros.</p>
                  <button
                    onClick={() => setVistaActiva('ia')}
                    className="mt-4 px-4 py-2 bg-salud-blue text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Sparkles size={14} /> Crear receta con IA
                  </button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resultadosBusqueda.map(r => (
                    <RecetaCard
                      key={r.id}
                      receta={r}
                      onSelect={() => setRecetaSeleccionada(r)}
                      onDelete={() => handleDeleteRecipe(r)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {showFiltrosAvanzados && (
            <FiltrosAvanzados
              filtros={filtros}
              onUpdate={setFiltros}
              onClose={() => setShowFiltrosAvanzados(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
