-- ==========================================
-- Migración: Tablas del Portal de Pacientes
-- ==========================================

-- 1. patient_prescriptions (Prescripciones Médicas)
CREATE TABLE public.patient_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  medicamento TEXT NOT NULL,
  dosis TEXT NOT NULL,
  frecuencia TEXT NOT NULL,
  duracion_dias INTEGER NOT NULL,
  indicaciones TEXT,
  fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.patient_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pacientes ven sus propias prescripciones" ON public.patient_prescriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.patients WHERE id = patient_prescriptions.patient_id AND user_id = auth.uid())
);
CREATE POLICY "Staff gestiona prescripciones" ON public.patient_prescriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'especialista', 'staff'))
);

-- 2. patient_daily_logs (Registro Diario del Paciente)
CREATE TABLE public.patient_daily_logs (
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hidratacion_ml INTEGER DEFAULT 0,
  comidas_registradas JSONB DEFAULT '{}'::jsonb,
  habitos JSONB DEFAULT '{}'::jsonb,
  adherencia_prescripciones JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (patient_id, fecha)
);

ALTER TABLE public.patient_daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pacientes gestionan sus registros diarios" ON public.patient_daily_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.patients WHERE id = patient_daily_logs.patient_id AND user_id = auth.uid())
);
CREATE POLICY "Staff ve registros diarios" ON public.patient_daily_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'especialista', 'staff'))
);

-- 3. patient_favorite_recipes (Recetas Favoritas)
CREATE TABLE public.patient_favorite_recipes (
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (patient_id, recipe_id)
);

ALTER TABLE public.patient_favorite_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pacientes gestionan sus favoritas" ON public.patient_favorite_recipes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.patients WHERE id = patient_favorite_recipes.patient_id AND user_id = auth.uid())
);

-- 4. patient_recipe_ratings (Calificaciones de Recetas)
CREATE TABLE public.patient_recipe_ratings (
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (patient_id, recipe_id)
);

ALTER TABLE public.patient_recipe_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pacientes gestionan sus calificaciones" ON public.patient_recipe_ratings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.patients WHERE id = patient_recipe_ratings.patient_id AND user_id = auth.uid())
);
CREATE POLICY "Todos pueden ver calificaciones" ON public.patient_recipe_ratings FOR SELECT USING (true);
