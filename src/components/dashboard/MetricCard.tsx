import { useState } from 'react';
import type { ResultadosMetabolicos } from '../../types';
import { IMC_CONFIG } from '../../utils/constants';
import { formatNumber } from '../../utils/formulas';
import Modal from '../ui/Modal';

interface MetricCardProps {
  type: 'imc' | 'get';
  resultados: ResultadosMetabolicos;
}

export default function MetricCard({ type, resultados }: MetricCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (type === 'imc') {
    const config = IMC_CONFIG[resultados.clasificacionImc];
    
    const imcRanges = [
      { category: 'Bajo peso', range: 'Menos de 18.5', key: 'Bajo peso' },
      { category: 'Peso saludable', range: '18.5 – 24.9', key: 'Normal' },
      { category: 'Sobrepeso', range: '25.0 – 29.9', key: 'Sobrepeso' },
      { category: 'Obesidad', range: '30.0 o más', key: 'Obesidad' },
    ] as const;

    return (
      <>
        <div 
          onClick={() => setIsModalOpen(true)}
          className={`${config.color} border border-border/30 rounded-[var(--radius-lg)] p-5 animate-slide-up delay-1 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-text-secondary">IMC</span>
            <span className="text-lg">{config.emoji}</span>
          </div>
          <p className="text-3xl font-extrabold text-text-primary mb-1">
            {formatNumber(resultados.imc)}
          </p>
          <p className={`text-sm font-bold ${config.textColor}`}>
            {resultados.clasificacionImc}
          </p>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Rangos de IMC"
        >
          <div className="space-y-4">
            <p className="text-sm text-text-secondary mb-2">
              El Índice de Masa Corporal (IMC) nos ayuda a conocer en qué categoría de peso te encuentras.
            </p>
            <div className="flex flex-col gap-3">
              {imcRanges.map((item) => {
                const itemConfig = IMC_CONFIG[item.key as keyof typeof IMC_CONFIG];
                const isActive = resultados.clasificacionImc === item.key;
                
                return (
                  <div 
                    key={item.category} 
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isActive 
                        ? `${itemConfig.color}` 
                        : 'border-border/50 bg-bg-primary hover:bg-bg-elevated'
                    }`}
                    style={isActive ? { borderColor: `var(--color-${itemConfig.textColor.replace('text-', '')})`, borderWidth: '2px' } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{itemConfig.emoji}</span>
                      <span className={`font-semibold ${isActive ? itemConfig.textColor : 'text-text-primary'}`}>
                        {item.category}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${isActive ? itemConfig.textColor : 'text-text-secondary'}`}>
                      {item.range}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <div className="bg-salud-blue-soft border border-border/30 rounded-[var(--radius-lg)] p-5 animate-slide-up delay-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-text-secondary">Gasto Energético</span>
        <span className="text-lg">🔥</span>
      </div>
      <p className="text-3xl font-extrabold text-text-primary mb-1">
        {formatNumber(resultados.get, 0)}
      </p>
      <p className="text-sm font-bold text-salud-blue">kcal / día</p>
    </div>
  );
}
