import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, ArrowLeft, Save } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Textarea from '../../components/ui/Textarea';
import { supabase } from '../../lib/supabase';

export default function RecipeCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'desayuno',
    dificultad: 'facil',
    tiempoPreparacionMin: 15,
    porcionesRinde: 1,
    ingredientesText: '',
    instruccionesText: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Parsear ingredientes y direcciones simples
    const ingredientes = form.ingredientesText.split('\n').filter(i => i.trim() !== '').map(nombre => ({ nombre, cantidad: 1, unidad: 'pza' }));
    const instrucciones = form.instruccionesText.split('\n').filter(i => i.trim() !== '');

    const { error } = await supabase.from('recipes').insert({
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoria: form.categoria,
      dificultad: form.dificultad,
      tiempo_preparacion_min: form.tiempoPreparacionMin,
      porciones_rinde: form.porcionesRinde,
      ingredientes: ingredientes,
      instrucciones: instrucciones,
      origen: 'staff',
      macros_por_porcion: { kcal: 0, prot: 0, cho: 0, grasas: 0 },
      datos_nutricionales_avanzados: {},
      apta_para_condiciones: [],
      restricciones: [],
      tags: [],
    });

    setIsSubmitting(false);
    if (!error) {
      alert('Receta creada con éxito!');
      navigate('/staff/dashboard'); // O a una lista de recetas
    } else {
      console.error(error);
      alert('Error al crear la receta');
    }
  };

  return (
    <div className="w-full mx-auto min-w-0 animate-fade-in pb-12 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-bg-elevated transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight flex items-center gap-2">
            <ChefHat className="text-salud-green" /> Crear Nueva Receta
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Añade recetas al catálogo global de la plataforma.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card padding="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Nombre</label>
              <Input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Descripción</label>
              <Textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Categoría</label>
              <Select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                <option value="desayuno">Desayuno</option>
                <option value="almuerzo">Almuerzo</option>
                <option value="cena">Cena</option>
                <option value="colacion">Colación</option>
                <option value="snack">Snack</option>
                <option value="bebida">Bebida</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Dificultad</label>
              <Select value={form.dificultad} onChange={e => setForm({...form, dificultad: e.target.value})}>
                <option value="facil">Fácil</option>
                <option value="media">Media</option>
                <option value="avanzada">Avanzada</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Tiempo Preparación (min)</label>
              <Input type="number" value={form.tiempoPreparacionMin} onChange={e => setForm({...form, tiempoPreparacionMin: Number(e.target.value)})} min={1} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Porciones que rinde</label>
              <Input type="number" value={form.porcionesRinde} onChange={e => setForm({...form, porcionesRinde: Number(e.target.value)})} min={1} />
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="text-base font-bold mb-4">Ingredientes & Instrucciones</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Ingredientes (Uno por línea)</label>
              <Textarea rows={4} value={form.ingredientesText} onChange={e => setForm({...form, ingredientesText: e.target.value})} placeholder="Ej. 1 taza de leche&#10;2 huevos" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Instrucciones (Uno por línea)</label>
              <Textarea rows={4} value={form.instruccionesText} onChange={e => setForm({...form, instruccionesText: e.target.value})} placeholder="Paso 1...&#10;Paso 2..." required />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={isSubmitting} icon={<Save size={18} />}>
            {isSubmitting ? 'Guardando...' : 'Guardar Receta'}
          </Button>
        </div>
      </form>
    </div>
  );
}
