import { Activity, BookOpen, AlertCircle, PlayCircle, FileText, ChevronRight } from 'lucide-react';
import Card from '../components/ui/Card';
import AlertBanner from '../components/ui/AlertBanner';

export default function Guias() {
  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
          Aprende y Mejora
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Material educativo y rutinas para tu rehabilitación.
        </p>
      </div>

      {/* 3. Interacción Fármaco-Nutriente (Alerta Prioritaria si aplica) */}
      <div className="animate-slide-up [animation-delay:100ms]">
        <AlertBanner
          message="Interacción Fármaco-Nutriente"
          detail="Aquí se mostrarán alertas si alguno de tus medicamentos (ej. Metotrexato, AINEs) requiere que evites ciertos alimentos o tomes suplementos específicos."
          variant="warning"
        />
      </div>

      {/* 1. Fisioterapia en Casa */}
      <div className="space-y-3 animate-slide-up [animation-delay:200ms]">
        <div className="flex items-center gap-2">
          <Activity className="text-salud-blue" size={20} />
          <h2 className="text-lg font-bold text-text-primary">Fisioterapia en Casa</h2>
        </div>
        
        {/* Contenedores de Video/Rutina (Placeholders) */}
        <div className="grid grid-cols-1 gap-3">
          <button className="bg-bg-card rounded-[var(--radius-lg)] border border-border/40 p-4 flex items-center gap-4 hover:border-salud-blue/50 transition-colors text-left w-full group">
            <div className="w-16 h-16 rounded-xl bg-salud-blue-soft/30 flex items-center justify-center flex-shrink-0 group-hover:bg-salud-blue-soft transition-colors">
              <PlayCircle className="text-salud-blue" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-text-primary text-sm">Rutina de Movilidad Articular</h3>
              <p className="text-xs text-text-secondary mt-1">10 min • Recomendado para artrosis leve</p>
            </div>
            <ChevronRight size={20} className="text-text-tertiary group-hover:text-salud-blue transition-colors" />
          </button>

          <button className="bg-bg-card rounded-[var(--radius-lg)] border border-border/40 p-4 flex items-center gap-4 hover:border-salud-blue/50 transition-colors text-left w-full group">
            <div className="w-16 h-16 rounded-xl bg-salud-blue-soft/30 flex items-center justify-center flex-shrink-0 group-hover:bg-salud-blue-soft transition-colors">
              <PlayCircle className="text-salud-blue" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-text-primary text-sm">Estiramientos Matutinos</h3>
              <p className="text-xs text-text-secondary mt-1">5 min • Reduce la rigidez inicial</p>
            </div>
            <ChevronRight size={20} className="text-text-tertiary group-hover:text-salud-blue transition-colors" />
          </button>
        </div>
      </div>

      {/* 2. Nutrición e Infografías */}
      <div className="space-y-3 animate-slide-up [animation-delay:300ms]">
        <div className="flex items-center gap-2">
          <BookOpen className="text-salud-green" size={20} />
          <h2 className="text-lg font-bold text-text-primary">Nutrición y Hábitos</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Card de Infografía */}
          <Card className="flex flex-col h-full cursor-pointer hover:border-salud-green/50 transition-colors group">
            <div className="w-full h-24 bg-salud-green/10 rounded-lg mb-3 flex items-center justify-center group-hover:bg-salud-green/20 transition-colors">
              <FileText className="text-salud-green" size={32} />
            </div>
            <h3 className="font-bold text-text-primary text-sm leading-tight">Alimentos Antiinflamatorios</h3>
            <p className="text-[11px] text-text-tertiary mt-auto pt-2">Leer guía PDF</p>
          </Card>

          {/* Card de Infografía */}
          <Card className="flex flex-col h-full cursor-pointer hover:border-salud-green/50 transition-colors group">
            <div className="w-full h-24 bg-salud-green/10 rounded-lg mb-3 flex items-center justify-center group-hover:bg-salud-green/20 transition-colors">
              <FileText className="text-salud-green" size={32} />
            </div>
            <h3 className="font-bold text-text-primary text-sm leading-tight">Guía de Hidratación en Adulto Mayor</h3>
            <p className="text-[11px] text-text-tertiary mt-auto pt-2">Leer guía PDF</p>
          </Card>
          
          <Card className="col-span-2 flex items-center gap-3 cursor-pointer hover:border-salud-green/50 transition-colors group">
             <div className="w-12 h-12 bg-salud-green/10 rounded-lg flex items-center justify-center group-hover:bg-salud-green/20 transition-colors">
               <AlertCircle className="text-salud-green" size={24} />
             </div>
             <div>
               <h3 className="font-bold text-text-primary text-sm">Semáforo de Síntomas</h3>
               <p className="text-[11px] text-text-secondary mt-0.5">Cuándo contactar a tu médico</p>
             </div>
          </Card>
        </div>
      </div>
      
    </div>
  );
}
