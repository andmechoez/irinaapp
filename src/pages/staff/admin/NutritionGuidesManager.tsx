import { useState, useEffect } from "react";
import { BookOpen, Plus, Trash2, ExternalLink, FileText, X, CheckSquare, Square, Edit2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import { useSystemOptions } from "../../../contexts/SystemOptionsContext";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import Badge from "../../../components/ui/Badge";
import type { NutritionGuide } from "../../../types";

export default function NutritionGuidesManager() {
  const { user } = useAuth();
  const { getOptionsByCategory } = useSystemOptions();
  const condicionesDisponibles = getOptionsByCategory("condicion");

  const [guides, setGuides] = useState<NutritionGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm = { titulo: "", descripcion: "", url: "", condiciones: [] as string[] };
  const [form, setForm] = useState(emptyForm);

  const fetchGuides = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("nutrition_guides")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setGuides(data as NutritionGuide[]);
    setLoading(false);
  };

  useEffect(() => { fetchGuides(); }, []);

  const openModal = (guide?: NutritionGuide) => {
    if (guide) {
      setEditingId(guide.id);
      setForm({ titulo: guide.titulo, descripcion: guide.descripcion || "", url: guide.url, condiciones: guide.condiciones || [] });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setSubmitting(false); };

  const toggleCondicion = (valor: string) => {
    setForm(f => ({
      ...f,
      condiciones: f.condiciones.includes(valor) ? f.condiciones.filter(c => c !== valor) : [...f.condiciones, valor],
    }));
  };

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.url.trim() || form.condiciones.length === 0) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await supabase.from("nutrition_guides").update({
          titulo: form.titulo.trim(), descripcion: form.descripcion.trim() || null,
          url: form.url.trim(), condiciones: form.condiciones,
        }).eq("id", editingId);
      } else {
        await supabase.from("nutrition_guides").insert({
          titulo: form.titulo.trim(), descripcion: form.descripcion.trim() || null,
          url: form.url.trim(), condiciones: form.condiciones,
          subido_por: user?.id || null, subido_por_nombre: user?.nombre || null, activo: true,
        });
      }
      await fetchGuides();
      closeModal();
    } catch (e) {
      console.error("Error guardando guia:", e);
      alert("Error al guardar la guia. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (guide: NutritionGuide) => {
    await supabase.from("nutrition_guides").update({ activo: !guide.activo }).eq("id", guide.id);
    await fetchGuides();
  };

  const isFormValid = form.titulo.trim() && form.url.trim() && form.condiciones.length > 0;

  return (
    <>
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-salud-blue" />
            <h3 className="text-lg font-bold text-text-primary">Guias Nutricionales</h3>
          </div>
          <Button size="sm" icon={<Plus size={16} />} onClick={() => openModal()}>Nueva Guia</Button>
        </div>
        <p className="text-xs text-text-tertiary">
          Sube links a PDFs o recursos educativos. Los pacientes veran solo las guias que correspondan a sus condiciones medicas.
        </p>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-[var(--radius-md)] bg-bg-elevated animate-pulse" />)}</div>
        ) : guides.length === 0 ? (
          <div className="py-10 text-center">
            <FileText size={32} className="mx-auto mb-2 text-text-tertiary opacity-40" />
            <p className="text-sm text-text-tertiary">No hay guias publicadas aun.</p>
            <p className="text-xs text-text-tertiary mt-1">Agrega la primera usando el boton "Nueva Guia".</p>
          </div>
        ) : (
          <div className="space-y-2">
            {guides.map(guide => (
              <div key={guide.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-[var(--radius-md)] border transition-all ${guide.activo ? "border-border/40 bg-bg-card" : "border-border/20 bg-bg-elevated/40 opacity-60"}`}>
                <div className="w-9 h-9 rounded-lg bg-salud-blue-soft flex items-center justify-center text-salud-blue flex-shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-text-primary truncate">{guide.titulo}</p>
                    {!guide.activo && <Badge variant="default">Inactiva</Badge>}
                  </div>
                  {guide.descripcion && <p className="text-xs text-text-tertiary mt-0.5 line-clamp-1">{guide.descripcion}</p>}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {guide.condiciones.map(c => (
                      <span key={c} className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-salud-blue-soft text-salud-blue border border-salud-blue/20">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                  <a href={guide.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-text-tertiary hover:text-salud-blue transition-colors rounded-md hover:bg-salud-blue-soft/50" title="Ver documento">
                    <ExternalLink size={15} />
                  </a>
                  <button onClick={() => openModal(guide)} className="p-1.5 text-text-tertiary hover:text-salud-blue transition-colors rounded-md hover:bg-salud-blue-soft/50" title="Editar">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => handleToggleActive(guide)} className={`p-1.5 transition-colors rounded-md ${guide.activo ? "text-salud-red hover:bg-salud-red/10" : "text-salud-green hover:bg-salud-green/10"}`} title={guide.activo ? "Desactivar" : "Activar"}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={closeModal} />
          <div className="relative w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] bg-bg-card rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] shadow-[var(--shadow-elevated)] flex flex-col animate-slide-up">
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <BookOpen size={18} className="text-salud-blue" />
                {editingId ? "Editar Guia" : "Nueva Guia Nutricional"}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Titulo de la guia *</label>
                <Input type="text" placeholder="Ej: Guia nutricional para Diabetes tipo 2" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Descripcion breve (opcional)</label>
                <Textarea placeholder="Ej: Recomendaciones de alimentacion para pacientes con DM2" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">Link al documento (PDF, Drive, etc.) *</label>
                <Input type="url" placeholder="https://drive.google.com/file/..." value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
                <p className="text-xs text-text-tertiary mt-1">Asegurate de que el link sea publico o accesible para los pacientes.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Condiciones medicas asociadas *</label>
                {condicionesDisponibles.length === 0 ? (
                  <p className="text-xs text-text-tertiary italic">No hay condiciones configuradas. Agregarlas en Diccionarios Medicos.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {condicionesDisponibles.map(c => {
                      const selected = form.condiciones.includes(c.valor);
                      return (
                        <button key={c.id} type="button" onClick={() => toggleCondicion(c.valor)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] border text-left text-sm transition-all cursor-pointer ${selected ? "border-salud-blue bg-salud-blue-soft text-salud-blue font-semibold" : "border-border/50 bg-bg-elevated text-text-secondary hover:border-salud-blue/40 hover:text-text-primary"}`}>
                          {selected ? <CheckSquare size={15} className="flex-shrink-0" /> : <Square size={15} className="flex-shrink-0 opacity-40" />}
                          <span className="truncate">{c.icono ? `${c.icono} ` : ""}{c.valor}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {form.condiciones.length > 0 && (
                  <p className="text-xs text-salud-blue mt-1.5 font-medium">
                    {form.condiciones.length} condicion{form.condiciones.length !== 1 ? "es" : ""} seleccionada{form.condiciones.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border/50 bg-bg-elevated/30 flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={closeModal}>Cancelar</Button>
              <Button size="sm" disabled={submitting || !isFormValid} onClick={handleSave}>
                {submitting ? "Guardando..." : editingId ? "Guardar Cambios" : "Publicar Guia"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
