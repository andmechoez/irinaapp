import { useState } from 'react';
import ContentManagement from './ContentManagement';
import SystemOptionsManagement from './SystemOptionsManagement';
import { Database, BookOpen, Layers } from 'lucide-react';

export default function UnifiedContent() {
  const [activeTab, setActiveTab] = useState<'contenido' | 'diccionarios'>('contenido');

  return (
    <div className="space-y-6 animate-fade-in pb-12 w-full mx-auto max-w-5xl">
      {/* Global Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2">
          <Layers size={28} className="text-salud-blue" />
          Gestión y Contenido Clínico
        </h1>
        <p className="text-text-secondary mt-1">
          Administra la base de datos de salud y automatiza retos, rutinas y recomendaciones.
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-border/60 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('contenido')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2 cursor-pointer
            ${activeTab === 'contenido'
              ? 'border-salud-blue text-salud-blue bg-salud-blue/5'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
            }`}
        >
          <BookOpen size={18} />
          Contenido Educativo
        </button>
        <button
          onClick={() => setActiveTab('diccionarios')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2 cursor-pointer
            ${activeTab === 'diccionarios'
              ? 'border-salud-blue text-salud-blue bg-salud-blue/5'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
            }`}
        >
          <Database size={18} />
          Diccionarios Médicos
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'contenido' ? <ContentManagement /> : <SystemOptionsManagement />}
      </div>
    </div>
  );
}
