-- Create system_options table
CREATE TABLE public.system_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL,
  valor TEXT NOT NULL,
  icono TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.system_options ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Public read access for system_options" 
  ON public.system_options 
  FOR SELECT 
  TO public 
  USING (true);

-- Insertar opciones iniciales para mantener compatibilidad
INSERT INTO public.system_options (categoria, valor, icono) VALUES
-- Condiciones Médicas
('condicion', 'Diabetes 1', '💉'),
('condicion', 'Diabetes 2', '🩸'),
('condicion', 'Hipertensión', '❤️‍🔥'),
('condicion', 'Lesión muscular', '💪'),
('condicion', 'Dislipidemia', '🧬'),
('condicion', 'Gastritis', '🫄'),
('condicion', 'Osteoporosis/artrosis', '🦴'),
('condicion', 'Hipotiroidismo', '🦋'),
('condicion', 'SOP', '🔬'),
('condicion', 'Artritis', '💥'),
('condicion', 'Cirugía menor', '✂️'),
('condicion', 'Infección aguda', '🦠'),
('condicion', 'Trauma esquelético', '🚑'),
-- Alergias
('alergia', 'Penicilina', '💊'),
('alergia', 'Mariscos', '🦐'),
('alergia', 'Frutos Secos', '🥜'),
('alergia', 'AINEs (Ibuprofeno)', '💊'),
('alergia', 'Lácteos', '🥛'),
-- Medicamentos Comunes
('medicamento', 'Metformina', '💊'),
('medicamento', 'Insulina', '💉'),
('medicamento', 'Losartán / Enalapril', '💊'),
('medicamento', 'Warfarina', '💊'),
('medicamento', 'Aspirina / Anticoagulantes', '💊'),
('medicamento', 'Estatinas (Colesterol)', '💊'),
('medicamento', 'Diuréticos', '💊'),
('medicamento', 'Levotiroxina', '💊'),
-- Restricciones Físicas / Digestivas
('restriccion_fisica', 'Dificultad para masticar/tragar', '🦷'),
('restriccion_fisica', 'Intolerancia a la Lactosa', '🥛'),
('restriccion_fisica', 'Estreñimiento frecuente', '🚽');
