import type { AdecuacionNutricional, EvaluacionMenu, MenuTemplate, MenuTiempo, SmaeRecord, AsignacionMenu } from '../types';
import smaeData from '../data/smae.json';
import templatesData from '../data/menu_templates.json';

const smaeDb = smaeData as SmaeRecord[];
const templatesDb = templatesData as MenuTemplate[];

/**
 * Busca un registro en la base de datos del Sistema Mexicano de Alimentos Equivalentes (SMAE) por su ID.
 * 
 * @param {string} id - El identificador único del alimento en el SMAE.
 * @returns {SmaeRecord | undefined} El registro del alimento o undefined si no se encuentra.
 */
export const getSmaeRecord = (id: string): SmaeRecord | undefined => {
  return smaeDb.find((record) => record.id === id);
};

/**
 * Obtiene la plantilla estructurada de un menú por su ID desde la base de datos de plantillas.
 * 
 * @param {string} id - El identificador único de la plantilla del menú.
 * @returns {MenuTemplate | undefined} La plantilla de menú o undefined si no se encuentra.
 */
export const getMenuTemplate = (id: string): MenuTemplate | undefined => {
  return templatesDb.find((t) => t.id === id);
};

/**
 * Calcula los macronutrientes (CHO, Proteína, Grasas) y calorías reales de un tiempo de comida
 * específico (ej. "Desayuno") sumando todas las raciones de alimentos y sus equivalencias SMAE.
 * 
 * @param {MenuTiempo} meal - Objeto que define el tiempo de comida y sus raciones.
 * @returns {AdecuacionNutricional} El total de macronutrientes y calorías aportadas por esa comida.
 */
export const calculateMealMacros = (meal: MenuTiempo): AdecuacionNutricional => {
  let cho = 0;
  let prot = 0;
  let grasas = 0;

  meal.raciones.forEach((racion) => {
    const record = getSmaeRecord(racion.smae_id);
    if (record) {
      cho += record.cho * racion.cantidad;
      prot += record.prot * racion.cantidad;
      grasas += record.grasas * racion.cantidad;
    }
  });

  // Kcal calculadas matemáticamente: (CHO x 4) + (PROT x 4) + (GRASA x 9)
  const kcal = (cho * 4) + (prot * 4) + (grasas * 9);

  return { cho, prot, grasas, kcal };
};

/**
 * Evalúa el aporte nutricional de un menú completo frente a los macros teóricos calculados
 * para el paciente, devolviendo el porcentaje de adecuación para cada macronutriente y caloría.
 * 
 * Nota clínica: Un porcentaje de adecuación ideal se encuentra generalmente entre 95% y 105%.
 * 
 * @param {string} templateId - El ID de la plantilla de menú asignada.
 * @param {AdecuacionNutricional} teorico - El cálculo metabólico teórico ideal del paciente.
 * @returns {EvaluacionMenu} Un objeto con los macros reales, teóricos y su porcentaje de adecuación.
 * @throws {Error} Si el template de menú no existe.
 */
export const evaluateMenu = (templateId: string, teorico: AdecuacionNutricional): EvaluacionMenu => {
  const template = getMenuTemplate(templateId);
  
  if (!template) {
    throw new Error(`Template de menú no encontrado: ${templateId}`);
  }

  let realCho = 0;
  let realProt = 0;
  let realGrasas = 0;

  template.tiempos.forEach((meal) => {
    const mealMacros = calculateMealMacros(meal);
    realCho += mealMacros.cho;
    realProt += mealMacros.prot;
    realGrasas += mealMacros.grasas;
  });

  const realKcal = (realCho * 4) + (realProt * 4) + (realGrasas * 9);

  const real: AdecuacionNutricional = {
    cho: realCho,
    prot: realProt,
    grasas: realGrasas,
    kcal: realKcal,
  };

  const porcentajeAdecuacion = {
    cho: teorico.cho > 0 ? Math.round((real.cho / teorico.cho) * 100) : 0,
    prot: teorico.prot > 0 ? Math.round((real.prot / teorico.prot) * 100) : 0,
    grasas: teorico.grasas > 0 ? Math.round((real.grasas / teorico.grasas) * 100) : 0,
    kcal: teorico.kcal > 0 ? Math.round((real.kcal / teorico.kcal) * 100) : 0,
  };

  return {
    real,
    teorico,
    porcentajeAdecuacion,
  };
};

/**
 * Motor Clínico de Asignación de Menús: 
 * Encuentra y asigna automáticamente la plantilla de dieta pre-estructurada cuya 
 * meta calórica sea la más cercana (closest match) al Gasto Energético Total (GET) 
 * ajustado del paciente, aplicando guardrails de seguridad clínica (mínimo 1200 kcal, máximo 3000 kcal).
 * 
 * @param {number} getPaciente - Gasto Energético Total (Kcal) calculado para el paciente.
 * @param {MenuTemplate[]} [plantillasDisponibles=templatesDb] - Lista de plantillas disponibles en el sistema.
 * @returns {AsignacionMenu} El resultado de la asignación con la plantilla óptima y un log de auditoría del proceso.
 * @throws {Error} Si no hay plantillas disponibles en la base de datos.
 */
export const asignarPlantillaOptima = (getPaciente: number, plantillasDisponibles: MenuTemplate[] = templatesDb): AsignacionMenu => {
  if (!plantillasDisponibles || plantillasDisponibles.length === 0) {
    throw new Error('No hay plantillas de menú disponibles para asignar.');
  }

  // 1. Guardrails (Límites de Seguridad Clínicos)
  let getAjustado = getPaciente;
  let mensajeGuardrail = '';

  if (getPaciente < 1200) {
    getAjustado = 1200;
    mensajeGuardrail = ' [Guardrail: Ajustado al límite inferior de seguridad 1200 Kcal]';
  } else if (getPaciente > 3000) {
    getAjustado = 3000;
    mensajeGuardrail = ' [Guardrail: Ajustado al límite superior de seguridad 3000 Kcal]';
  }

  // 2. Algoritmo de Búsqueda (Closest Match con Math.abs)
  let plantillaGanadora = plantillasDisponibles[0];
  let menorDiferencia = Math.abs(getAjustado - plantillaGanadora.target_kcal);

  for (const plantilla of plantillasDisponibles) {
    const diferenciaActual = Math.abs(getAjustado - plantilla.target_kcal);
    if (diferenciaActual < menorDiferencia) {
      menorDiferencia = diferenciaActual;
      plantillaGanadora = plantilla;
    }
  }

  // 3. Log del margen de tolerancia
  const diferenciaReal = plantillaGanadora.target_kcal - getAjustado;
  const signo = diferenciaReal > 0 ? '+' : '';
  const mensajeLog = `Diferencia de ${signo}${Math.abs(diferenciaReal)} Kcal respecto al valor teórico ajustado (${Math.round(getAjustado)} Kcal).${mensajeGuardrail}`;

  return {
    plantilla: plantillaGanadora,
    mensajeLog,
    getAjustado
  };
};
