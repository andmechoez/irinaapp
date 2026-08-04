-- ==============================================================================
-- Migración: Extensión Clínica de Bioimpedancia e Insulina
-- Fecha: 2026-07-26
-- Descripción:
-- 1. Añadir columna composicion_corporal (JSONB) en patients y evaluations para 
--    almacenar porcentaje de grasa total, grasa visceral (índice 1-20),
--    músculo esquelético (% y kg), agua corporal y edad metabólica.
-- 2. Documentar en laboratorios la inclusión de insulina (µU/mL) y homaIr.
-- ==============================================================================

-- 1. Agregar composicion_corporal a la tabla patients si no existe
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS composicion_corporal JSONB DEFAULT '{}'::jsonb;

-- 2. Agregar composicion_corporal a la tabla evaluations si no existe
ALTER TABLE public.evaluations 
ADD COLUMN IF NOT EXISTS composicion_corporal JSONB DEFAULT '{}'::jsonb;

-- Comentarios explicativos sobre la estructura JSONB
COMMENT ON COLUMN public.patients.composicion_corporal IS 'Estructura JSONB de bioimpedancia: { porcentajeGrasa, grasaVisceral, musculoEsqueletico, musculoEsqueleticoKg, aguaCorporal, edadMetabolica }';
COMMENT ON COLUMN public.evaluations.composicion_corporal IS 'Historial de composición corporal por evaluación de bioimpedancia.';
