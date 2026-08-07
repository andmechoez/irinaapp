import { useState, useEffect } from "react";
import { X, BookOpen, ExternalLink, FileText, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { NutritionGuide } from "../../types";

interface NutritionGuidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  condicionesPaciente: string[];
}

export default function NutritionGuidesModal({ isOpen, onClose, condicionesPaciente }: NutritionGuidesModalProps) {
  const [guides, setGuides] = useState<NutritionGuide[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchGuides = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("nutrition_guides")
        .select("*")
        .eq("activo", true)
        .order("created_at", { ascending: false });
      if (!error && data) {
        const filtered = (data as NutritionGuide[]).filter(g =>
          g.condiciones.some(c => condicionesPaciente.includes(c))
        );
        setGuides(filtered);
      }
      setLoading(false);
    };
    fetchGuides();
  }, [isOpen, condicionesPaciente]);

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = "unset"; }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div className="relative w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] bg-bg-card rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] shadow-[var(--shadow-elevated)] flex flex-col animate-slide-up">
        {/* Handle mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-salud-blue" />
            <h2 className="text-base font-bold text-text-primary">Mi Guia Nutricional</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-tertiary">
              <Loader2 size={28} className="animate-spin text-salud-blue" />
              <p className="text-sm">Cargando guias...</p>
            </div>
          ) : guides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-salud-blue-soft flex items-center justify-center">
                <BookOpen size={28} className="text-salud-blue opacity-60" />
              </div>
              <div>
                <p className="text-base font-bold text-text-primary">Sin guias disponibles</p>
                <p className="text-sm text-text-tertiary mt-1 max-w-[220px]">
                  Tu nutricionista preparara guias personalizadas para tus condiciones muy pronto.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-text-tertiary mb-4">
                Guias seleccionadas para tus condiciones de salud — {guides.length} disponible{guides.length !== 1 ? "s" : ""}
              </p>
              {guides.map(guide => (
                <a
                  key={guide.id}
                  href={guide.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 p-4 rounded-[var(--radius-md)] border border-border/50 bg-bg-card hover:border-salud-blue/40 hover:bg-salud-blue-soft/20 transition-all active:scale-[0.99]"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-salud-blue-soft flex items-center justify-center text-salud-blue flex-shrink-0 group-hover:bg-salud-blue group-hover:text-white transition-colors">
                    <FileText size={20} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary group-hover:text-salud-blue transition-colors truncate">
                      {guide.titulo}
                    </p>
                    {guide.descripcion && (
                      <p className="text-xs text-text-tertiary mt-0.5 line-clamp-2">{guide.descripcion}</p>
                    )}
                    {/* Condiciones tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {guide.condiciones
                        .filter(c => condicionesPaciente.includes(c))
                        .map(c => (
                          <span key={c} className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-salud-blue-soft text-salud-blue border border-salud-blue/20">
                            {c}
                          </span>
                        ))
                      }
                    </div>
                    {guide.subido_por_nombre && (
                      <p className="text-[10px] text-text-tertiary mt-1.5">Por {guide.subido_por_nombre}</p>
                    )}
                  </div>

                  {/* Arrow */}
                  <ExternalLink size={15} className="text-text-tertiary group-hover:text-salud-blue transition-colors flex-shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
