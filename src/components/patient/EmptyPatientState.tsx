import { FileClock, Info } from 'lucide-react';
import Card from '../ui/Card';

export default function EmptyPatientState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-fade-in text-center h-full min-h-[60vh]">
      <div className="w-20 h-20 bg-salud-blue-soft rounded-full flex items-center justify-center mb-6 shadow-sm">
        <FileClock size={36} className="text-salud-blue" />
      </div>
      
      <h2 className="text-2xl font-extrabold text-text-primary tracking-tight mb-3">
        Tu plan está en proceso
      </h2>
      
      <p className="text-text-secondary max-w-md text-base mb-8">
        Bienvenido a AVIVA. Tu especialista clínico aún no ha completado tu evaluación inicial ni ha asignado tus objetivos metabólicos.
      </p>

      <Card padding="md" className="text-left max-w-md w-full">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-salud-amber mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-salud-amber mb-1">
              ¿Qué hacer ahora?
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Por favor, comunícate con tu médico o nutricionista tratante, o espera a tu próxima consulta para que activen tu perfil clínico.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
