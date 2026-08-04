-- Añadir columnas de composicion_corporal y laboratorios a las tablas patients y evaluations
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS composicion_corporal JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS laboratorios JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS composicion_corporal JSONB DEFAULT '{}'::jsonb;
