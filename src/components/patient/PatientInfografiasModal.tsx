import { useEffect } from "react";
import { X, FileText, ExternalLink } from "lucide-react";
import type { Infografia } from "../../types/patients";

interface PatientInfografiasModalProps {
  isOpen: boolean;
  onClose: () => void;
  infografias: Infografia[];
}

export default function PatientInfografiasModal({ isOpen, onClose, infografias }: PatientInfografiasModalProps) {
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
            <FileText size={20} className="text-salud-green" />
            <h2 className="text-base font-bold text-text-primary">Infografías Médicas</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-24 sm:pb-5">
          {!infografias || infografias.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-salud-green-soft flex items-center justify-center">
                <FileText size={28} className="text-salud-green opacity-60" />
              </div>
              <div>
                <p className="text-base font-bold text-text-primary">Sin infografías disponibles</p>
                <p className="text-sm text-text-tertiary mt-1 max-w-[220px]">
                  Tu equipo médico aún no ha subido ninguna infografía para ti.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-text-tertiary mb-4">
                Infografías médicas asignadas para ti — {infografias.length} disponible{infografias.length !== 1 ? "s" : ""}
              </p>
              {infografias.map(info => (
                <a
                  key={info.id}
                  href={info.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-4 rounded-[var(--radius-md)] border border-border/50 bg-bg-card hover:border-salud-green/40 hover:bg-salud-green-soft/20 transition-all active:scale-[0.99]"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-salud-green-soft flex items-center justify-center text-salud-green flex-shrink-0 group-hover:bg-salud-green group-hover:text-white transition-colors">
                    <FileText size={20} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary group-hover:text-salud-green transition-colors truncate">
                      {info.titulo}
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5 truncate">{info.url}</p>
                  </div>

                  {/* Arrow */}
                  <ExternalLink size={15} className="text-text-tertiary group-hover:text-salud-green transition-colors flex-shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
