import { useState, useEffect } from 'react';
import { BellRing, BellOff, ArrowRight } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function NotificationOnboarding() {
  const { isSupported, permission, isSubscribed, isLoading, subscribe } = usePushNotifications();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show only if supported, not subscribed, and they haven't explicitly denied
    // Also, we use a local storage flag to not bother them every single time if they hit "Maybe later"
    const hasSkipped = localStorage.getItem('aviva_skip_notifications') === 'true';
    
    if (isSupported && !isSubscribed && permission === 'default' && !hasSkipped) {
      // Delay slightly to not overwhelm right after login
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isSupported, isSubscribed, permission]);

  const handleSkip = () => {
    localStorage.setItem('aviva_skip_notifications', 'true');
    setShow(false);
  };

  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      setShow(false);
    } else {
      // If they deny the native prompt, permission becomes 'denied' and the effect will hide it anyway.
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-bg-primary/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <Card className="max-w-md w-full overflow-hidden shadow-2xl border-salud-blue/20">
        <div className="bg-gradient-to-br from-salud-blue to-salud-primary p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <BellRing size={40} className="text-white animate-bounce-soft" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              ¡Mantén el ritmo!
            </h2>
            <p className="text-white/90 text-sm leading-relaxed">
              Activa las notificaciones para recibir recordatorios amigables sobre tus vasos de agua y comidas.
            </p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-salud-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-salud-blue font-bold text-sm">1</span>
              </div>
              <p className="text-sm text-text-secondary">
                Te avisaremos cuando sea momento de tomar tu siguiente <strong className="text-text-primary">vaso de agua</strong>.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-salud-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-salud-accent font-bold text-sm">2</span>
              </div>
              <p className="text-sm text-text-secondary">
                Recibe alertas a la hora de tus <strong className="text-text-primary">comidas principales</strong> para no saltarte horarios.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Button 
              onClick={handleEnable} 
              disabled={isLoading}
              className="w-full justify-center group"
              size="lg"
            >
              {isLoading ? 'Activando...' : 'Sí, activar notificaciones'}
              {!isLoading && <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </Button>
            <button 
              onClick={handleSkip}
              className="text-sm font-medium text-text-tertiary hover:text-text-primary transition-colors py-2 flex items-center justify-center gap-2"
            >
              <BellOff size={16} />
              Quizás más tarde
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
