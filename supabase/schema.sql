-- ==========================================
-- IrinaApp Supabase Schema
-- ==========================================

-- Habilitar la extensión pgcrypto para generación de UUIDs si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Perfiles Extendidos (Users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'especialista', 'staff', 'asistente', 'paciente')),
  nombre TEXT NOT NULL,
  apellido TEXT,
  institution_id TEXT,
  especialidad TEXT,
  telefono TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE POLICY "El staff y admin pueden ver a todos los usuarios" ON public.users FOR SELECT USING (
  auth.uid() = id OR public.get_user_role() IN ('admin', 'especialista', 'staff', 'asistente')
);

CREATE POLICY "Admins o usuarios pueden insertar en users" ON public.users FOR INSERT WITH CHECK (
  public.get_user_role() = 'admin' OR auth.uid() = id
);

CREATE POLICY "Admins o usuarios pueden actualizar users" ON public.users FOR UPDATE USING (
  public.get_user_role() = 'admin' OR auth.uid() = id
);

CREATE POLICY "Admins pueden eliminar users" ON public.users FOR DELETE USING (
  public.get_user_role() = 'admin'
);

-- 2. Tabla de Pacientes
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) UNIQUE, -- ID del usuario autenticado (paciente)
  institution_id TEXT,
  created_by UUID REFERENCES public.users(id), -- Quien lo creó
  assigned_to UUID REFERENCES public.users(id), -- A quien está asignado
  
  -- Datos personales que duplican o extienden el perfil base
  nombre TEXT NOT NULL,
  apellido TEXT,
  cedula TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefono TEXT,
  fecha_nacimiento DATE,
  edad INTEGER,
  sexo TEXT CHECK (sexo IN ('hombre', 'mujer')),
  tipo_sangre TEXT,
  alergias JSONB DEFAULT '[]'::jsonb,
  
  -- Estado
  estatus TEXT CHECK (estatus IN ('activo', 'inactivo', 'alta')) DEFAULT 'activo',
  
  -- Datos clínicos actuales (última evaluación)
  peso_kg NUMERIC(5,2),
  talla_cm NUMERIC(5,2),
  cintura_cm NUMERIC(5,2),
  cadera_cm NUMERIC(5,2),
  composicion_corporal JSONB DEFAULT '{}'::jsonb,
  nivel_actividad INTEGER CHECK (nivel_actividad BETWEEN 1 AND 5),
  objetivo TEXT,
  condiciones JSONB DEFAULT '[]'::jsonb,
  
  -- Resultados metabólicos actuales
  resultados_actuales JSONB,
  
  -- Metadata
  total_evaluaciones INTEGER DEFAULT 0,
  ultima_evaluacion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los pacientes pueden ver su propio registro" ON public.patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "El staff puede ver a todos los pacientes" ON public.patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'especialista', 'staff'))
);
CREATE POLICY "El staff puede crear/actualizar pacientes" ON public.patients FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'especialista', 'staff'))
);

-- 3. Tabla de Evaluaciones
CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  evaluador_id UUID REFERENCES public.users(id),
  evaluador_nombre TEXT,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  
  -- Medidas
  peso_kg NUMERIC(5,2),
  talla_cm NUMERIC(5,2),
  cintura_cm NUMERIC(5,2),
  cadera_cm NUMERIC(5,2),
  composicion_corporal JSONB DEFAULT '{}'::jsonb,
  nivel_actividad INTEGER,
  objetivo TEXT,
  
  -- Clínico
  condiciones JSONB,
  laboratorios JSONB,
  medicamentos JSONB,
  medicamentos_actuales TEXT,
  restricciones_fisicas JSONB,
  apoyo_familiar BOOLEAN,
  motivacion TEXT,
  
  -- Resultados calculados
  resultados JSONB,
  
  -- Notas
  notas_profesional TEXT,
  indicaciones_paciente TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en evaluations
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los pacientes pueden ver sus evaluaciones" ON public.evaluations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.patients WHERE id = evaluations.patient_id AND user_id = auth.uid())
);
CREATE POLICY "El staff puede gestionar evaluaciones" ON public.evaluations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'especialista', 'staff'))
);

-- 4. Tabla de Recetas (para permitir almacenar y crear nuevas recetas)
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT NOT NULL,
  dificultad TEXT NOT NULL,
  tiempo_preparacion_min INTEGER,
  origen TEXT DEFAULT 'sistema',
  ingredientes JSONB NOT NULL,
  instrucciones JSONB NOT NULL,
  porciones_rinde INTEGER,
  macros_por_porcion JSONB,
  datos_nutricionales_avanzados JSONB,
  apta_para_condiciones JSONB,
  restricciones JSONB,
  tags JSONB,
  imagen_url TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos pueden ver recetas" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "El staff puede insertar recetas" ON public.recipes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'especialista', 'staff'))
);

-- 5. Tabla de Menús y SMAE
CREATE TABLE public.menu_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_kcal INTEGER,
  nombre TEXT,
  tiempos JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.smae_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT,
  subcategoria TEXT,
  cho NUMERIC(5,2),
  prot NUMERIC(5,2),
  grasas NUMERIC(5,2),
  kcal NUMERIC(5,2)
);


-- ==========================================
-- Función RPC: Crear un usuario (Paciente) desde el Staff
-- ==========================================
-- Esta función elude la regla de que el cliente no puede crear otros usuarios
-- usando `SECURITY DEFINER`. Debe ser usada con cautela.

CREATE OR REPLACE FUNCTION public.create_patient_user(
  p_email TEXT,
  p_password TEXT,
  p_nombre TEXT,
  p_apellido TEXT,
  p_cedula TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con privilegios del creador (owner)
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Verificar si el caller es staff o admin (Opcional, pero recomendado para seguridad)
  -- IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'especialista', 'staff')) THEN
  --   RAISE EXCEPTION 'No tienes permiso para crear pacientes';
  -- END IF;

  -- 1. Crear el usuario en auth.users
  new_user_id := uuid_generate_v4();
  
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(), -- Auto-confirmado para facilitar el desarrollo, o NULL si quieres que valide el email
    NOW(),
    NOW(),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex')
  );

  -- 2. Insertar en public.users
  INSERT INTO public.users (
    id, email, role, nombre, apellido, is_active
  ) VALUES (
    new_user_id, p_email, 'paciente', p_nombre, p_apellido, true
  );

  RETURN new_user_id;
END;
$$;
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
