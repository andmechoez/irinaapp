import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export default function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="w-full px-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting line background */}
        <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-border" />
        {/* Connecting line progress */}
        <div
          className="absolute top-5 left-[10%] h-[2px] bg-salud-blue transition-all duration-500 ease-out"
          style={{
            width: `${((currentStep - 1) / (totalSteps - 1)) * 80}%`,
          }}
        />

        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  text-sm font-bold transition-all duration-300
                  ${isCompleted
                    ? 'bg-salud-blue text-white scale-100'
                    : isActive
                      ? 'bg-salud-blue text-white scale-110 shadow-lg shadow-salud-blue/30'
                      : 'bg-bg-elevated text-text-tertiary border-2 border-border'
                  }
                `}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? <Check size={18} strokeWidth={3} /> : step}
              </div>
              {labels && labels[i] && (
                <span
                  className={`
                    text-xs mt-2 font-medium text-center max-w-[80px]
                    ${isActive ? 'text-salud-blue' : 'text-text-tertiary'}
                  `}
                >
                  {labels[i]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
