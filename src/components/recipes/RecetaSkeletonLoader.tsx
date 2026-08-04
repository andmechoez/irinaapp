import { useState, useEffect } from 'react';
import { Sparkles, ChefHat, HeartPulse, Activity } from 'lucide-react';
import Card from '../ui/Card';

const MENSAJES_CARGA = [
  { texto: 'Conectando con motor clínico Gemini 2.5 Flash...', icono: Sparkles, color: 'text-salud-blue' },
  { texto: 'Analizando restricciones médicas y contraindicaciones...', icono: HeartPulse, color: 'text-salud-red' },
  { texto: 'Calculando gramajes, calorías y balance de macronutrientes...', icono: Activity, color: 'text-salud-green' },
  { texto: 'Diseñando una experiencia gastronómica gourmet y adaptada...', icono: ChefHat, color: 'text-salud-amber' },
];

export default function RecetaSkeletonLoader() {
  const [mensajeIdx, setMensajeIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMensajeIdx((prev) => (prev + 1) % MENSAJES_CARGA.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const MensajeActual = MENSAJES_CARGA[mensajeIdx];
  const IconoActual = MensajeActual.icono;

  return (
    <Card padding="lg" className="border-2 border-salud-blue/30 bg-gradient-to-br from-bg-card via-salud-blue-soft/10 to-bg-card animate-pulse shadow-lg">
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
        {/* Orbe animado */}
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-salud-blue-soft/50 border-2 border-salud-blue/40 shadow-inner">
          <IconoActual size={36} className={`${MensajeActual.color} animate-bounce transition-all duration-500`} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-salud-blue opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-salud-blue"></span>
          </span>
        </div>

        {/* Mensaje dinámico */}
        <div className="space-y-2 max-w-md">
          <p className="text-base font-extrabold text-text-primary transition-all duration-300">
            {MensajeActual.texto}
          </p>
          <p className="text-xs text-text-tertiary">
            Por favor espera unos segundos mientras la IA elabora el menú clínico...
          </p>
        </div>

        {/* Simulación visual de estructura de receta */}
        <div className="w-full max-w-lg space-y-4 pt-4 border-t border-border/40">
          <div className="h-6 bg-border/40 rounded-md w-3/4 mx-auto animate-pulse"></div>
          <div className="h-4 bg-border/30 rounded w-5/6 mx-auto animate-pulse"></div>
          
          <div className="grid grid-cols-4 gap-2 pt-2">
            <div className="h-14 bg-border/20 rounded-lg animate-pulse"></div>
            <div className="h-14 bg-border/20 rounded-lg animate-pulse"></div>
            <div className="h-14 bg-border/20 rounded-lg animate-pulse"></div>
            <div className="h-14 bg-border/20 rounded-lg animate-pulse"></div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="h-3 bg-border/30 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-border/30 rounded w-4/5 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    </Card>
  );
}
