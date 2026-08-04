// =============================================
// AVIVA — Constantes Clínicas
// Cuadro de intercambio de alimentos
// =============================================

import type { GrupoAlimentoIntercambio, IntercambioComida } from '../types';

/** Grupos de alimentos del Sistema Mexicano de Alimentos Equivalentes */
export const GRUPOS_ALIMENTO: GrupoAlimentoIntercambio[] = [
  { nombre: 'Cereales sin grasa', cho: 15, proteina: 2, grasa: 0, kcal: 70 },
  { nombre: 'Cereales con grasa', cho: 15, proteina: 2, grasa: 5, kcal: 115 },
  { nombre: 'Leguminosas', cho: 20, proteina: 8, grasa: 1, kcal: 120 },
  { nombre: 'Verduras', cho: 4, proteina: 2, grasa: 0, kcal: 25 },
  { nombre: 'Frutas', cho: 15, proteina: 0, grasa: 0, kcal: 60 },
  { nombre: 'AOA muy bajo en grasa', cho: 0, proteina: 7, grasa: 1, kcal: 40 },
  { nombre: 'AOA bajo en grasa', cho: 0, proteina: 7, grasa: 3, kcal: 55 },
  { nombre: 'AOA moderado en grasa', cho: 0, proteina: 7, grasa: 5, kcal: 75 },
  { nombre: 'Leche descremada', cho: 12, proteina: 9, grasa: 2, kcal: 95 },
  { nombre: 'Leche semidescremada', cho: 12, proteina: 9, grasa: 4, kcal: 110 },
  { nombre: 'Leche entera', cho: 12, proteina: 9, grasa: 8, kcal: 150 },
  { nombre: 'Grasas sin proteína', cho: 0, proteina: 0, grasa: 5, kcal: 45 },
  { nombre: 'Grasas con proteína', cho: 3, proteina: 3, grasa: 5, kcal: 70 },
  { nombre: 'Azúcares sin grasa', cho: 10, proteina: 0, grasa: 0, kcal: 40 },
  { nombre: 'Azúcares con grasa', cho: 10, proteina: 0, grasa: 5, kcal: 85 },
];

/** Simulación de desayuno fraccionado con intercambios */
export const DESAYUNO_EJEMPLO: IntercambioComida[] = [
  { grupo: 'Cereales sin grasa', raciones: 1.5, cho: 22.5, proteina: 3, grasa: 0, kcal: 105 },
  { grupo: 'AOA bajo en grasa', raciones: 1, cho: 0, proteina: 7, grasa: 3, kcal: 55 },
  { grupo: 'Frutas', raciones: 1, cho: 15, proteina: 0, grasa: 0, kcal: 60 },
  { grupo: 'Leche descremada', raciones: 1, cho: 12, proteina: 9, grasa: 2, kcal: 95 },
  { grupo: 'Grasas sin proteína', raciones: 1, cho: 0, proteina: 0, grasa: 5, kcal: 45 },
];

export const COMIDA_EJEMPLO: IntercambioComida[] = [
  { grupo: 'Cereales sin grasa', raciones: 2, cho: 30, proteina: 4, grasa: 0, kcal: 140 },
  { grupo: 'Leguminosas', raciones: 1, cho: 20, proteina: 8, grasa: 1, kcal: 120 },
  { grupo: 'AOA bajo en grasa', raciones: 2, cho: 0, proteina: 14, grasa: 6, kcal: 110 },
  { grupo: 'Verduras', raciones: 2, cho: 8, proteina: 4, grasa: 0, kcal: 50 },
  { grupo: 'Frutas', raciones: 1, cho: 15, proteina: 0, grasa: 0, kcal: 60 },
  { grupo: 'Grasas sin proteína', raciones: 1.5, cho: 0, proteina: 0, grasa: 7.5, kcal: 67.5 },
];

export const CENA_EJEMPLO: IntercambioComida[] = [
  { grupo: 'Cereales sin grasa', raciones: 1, cho: 15, proteina: 2, grasa: 0, kcal: 70 },
  { grupo: 'AOA bajo en grasa', raciones: 1, cho: 0, proteina: 7, grasa: 3, kcal: 55 },
  { grupo: 'Verduras', raciones: 1, cho: 4, proteina: 2, grasa: 0, kcal: 25 },
  { grupo: 'Leche descremada', raciones: 1, cho: 12, proteina: 9, grasa: 2, kcal: 95 },
];

/** Niveles de actividad con descriptores */
export const NIVELES_ACTIVIDAD = [
  { nivel: 1, nombre: 'Sedentario', descripcion: 'Poco o nada de ejercicio', icono: 'Armchair' },
  { nivel: 2, nombre: 'Ligero', descripcion: 'Ejercicio 1-3 días/semana', icono: 'Walk' },
  { nivel: 3, nombre: 'Moderado', descripcion: 'Ejercicio 3-5 días/semana', icono: 'Bike' },
  { nivel: 4, nombre: 'Activo', descripcion: 'Ejercicio 6-7 días/semana', icono: 'Dumbbell' },
  { nivel: 5, nombre: 'Muy activo', descripcion: 'Atleta o trabajo muy físico', icono: 'Flame' },
] as const;



/** Clasificación IMC con colores */
export const IMC_CONFIG = {
  'Bajo peso': { color: 'bg-salud-amber-soft', textColor: 'text-salud-amber', emoji: '⚠️' },
  'Normal': { color: 'bg-salud-green-soft', textColor: 'text-salud-green', emoji: '✅' },
  'Sobrepeso': { color: 'bg-salud-amber-soft', textColor: 'text-salud-amber', emoji: '⚡' },
  'Obesidad': { color: 'bg-salud-red-soft', textColor: 'text-salud-red', emoji: '🔴' },
} as const;

/** Cantidad de agua por porción (ml) */
export const PORCION_AGUA_ML = 250;
