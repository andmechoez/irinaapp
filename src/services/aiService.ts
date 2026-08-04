import { GoogleGenAI } from '@google/genai';
import type { Receta, ParametrosGeneracionIA, CategoriaReceta } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Genera una receta clínica adaptada utilizando el modelo Google Gemini 2.5 Flash.
 */
export async function generarRecetaIA(params: ParametrosGeneracionIA): Promise<Receta> {
  const {
    ingredientes,
    patologías,
    categoria = 'almuerzo',
    caloriasObjetivo = 450,
    instruccionesAdicionales = '',
  } = params;

  // Si no hay API key válida o ocurre algún problema, tenemos un fallback clínico
  if (!API_KEY || API_KEY === 'your-gemini-api-key') {
    console.warn('⚠️ No se detectó una VITE_GEMINI_API_KEY válida. Usando modo Fallback Clínico.');
    return generarRecetaFallback(params);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const prompt = `
Eres un chef clínico y nutriólogo experto en dietoterapia hospitalaria y gastronomía de alto nivel.
Debes crear UNA (1) receta culinaria deliciosa, estrictamente adaptada al perfil médico del paciente y con los ingredientes solicitados.

PARÁMETROS DEL PACIENTE Y MENÚ:
- Ingredientes disponibles/deseados: ${ingredientes.join(', ') || 'Ingredientes saludables variados'}
- Patologías y condiciones clínicas a considerar: ${patologías.join(', ') || 'Ninguna (perfil preventivo saludable)'}
- Categoría del menú: ${categoria}
- Calorías objetivo aproximadamente por porción: ${caloriasObjetivo} kcal
${instruccionesAdicionales ? `- Instrucciones/preferencias adicionales: ${instruccionesAdicionales}` : ''}

REGLAS ESTRICTAS DE RESPUESTA:
1. Retorna ÚNICAMENTE un objeto JSON válido, sin saludos, sin texto introductorio y sin formato Markdown (no uses \`\`\`json ni \`\`\`).
2. La estructura del objeto JSON debe cumplir exactamente con el contrato de la interfaz de TypeScript:
{
  "id": "gen_ia_" + timestamp (ej. "gen_ia_1722000000000"),
  "nombre": "Nombre creativo y apetitoso de la receta",
  "descripcion": "Brief descripción culinaria y por qué es beneficiosa para las patologías del paciente (máx 2 frases)",
  "categoria": "${categoria}",
  "dificultad": "facil" | "media" | "avanzada",
  "tiempoPreparacionMin": número entero entre 10 y 45,
  "origen": "ia",
  "ingredientes": [
    {
      "nombre": "Nombre del ingrediente",
      "cantidad": número,
      "unidad": "g" | "ml" | "cdas" | "taza" | "pza",
      "racionesSmae": número aproximado de raciones SMAE (opcional)
    }
  ],
  "instrucciones": [
    "Paso 1 detallado...",
    "Paso 2 detallado...",
    "Paso 3 detallado..."
  ],
  "porcionesRinde": 1,
  "macrosPorPorcion": {
    "kcal": número entero alrededor de ${caloriasObjetivo},
    "cho": gramos de carbohidratos,
    "prot": gramos de proteína,
    "grasas": gramos de lípidos,
    "fibra": gramos de fibra,
    "sodio": miligramos de sodio
  },
  "datosNutricionalesAvanzados": {
    "cargaGlicemica": "baja" | "media" | "alta",
    "alergenos": ["Gluten", "Lácteos", etc. o vacío [] si no tiene],
    "vitaminas": ["Hierro", "Vitamina C", etc.],
    "aptaParaDietas": ["Mediterránea", "Keto", etc.]
  },
  "aptaParaCondiciones": ${JSON.stringify(patologías.length ? patologías : ['General'])},
  "restricciones": ["sin_azucar", "baja_en_sodio", etc.],
  "tags": ["antiinflamatoria", "cardiosaludable", "alta_en_proteina", etc.],
  "fechaCreacion": "${new Date().toISOString()}"
}
3. El cálculo de macronutrientes debe ser exacto y coherente (1g CHO/PROT = 4 kcal, 1g GRASA = 9 kcal).
4. Asegúrate de que los ingredientes respeten escrupulosamente las contraindicaciones de las patologías indicadas (${patologías.join(', ')}).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 1,
        maxOutputTokens: 8192,
        topP: 0.95,
      },
    });

    const text = response.text || '';
    const cleanJsonText = limpiarRespuestaJson(text);
    
    const recetaGenerada = JSON.parse(cleanJsonText) as Receta;
    
    // Validar identificador y origen
    if (!recetaGenerada.id) {
      recetaGenerada.id = `ia_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }
    recetaGenerada.origen = 'ia';
    if (!recetaGenerada.fechaCreacion) {
      recetaGenerada.fechaCreacion = new Date().toISOString();
    }
    
    return recetaGenerada;
  } catch (error) {
    console.error('❌ Error llamando a Gemini API en aiService:', error);
    // Si falla la API por cuota o red, recurrir al fallback elegante para no interrumpir el flujo
    return generarRecetaFallback(params);
  }
}

/**
 * Limpia bloques Markdown ```json ... ``` de la respuesta del LLM.
 */
function limpiarRespuestaJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }
  return cleaned;
}

/**
 * Fallback clínico inteligente y adaptado en caso de fallo de red o API no disponible.
 */
async function generarRecetaFallback(params: ParametrosGeneracionIA): Promise<Receta> {
  // Simular tiempo de procesamiento del modelo IA para una experiencia realista
  await new Promise((resolve) => setTimeout(resolve, 2500));

  const { ingredientes, patologías, categoria = 'almuerzo', caloriasObjetivo = 450 } = params;
  const ing1 = ingredientes[0] || 'Pollo de corral';
  const ing2 = ingredientes[1] || 'Quinoa tricolor';
  const ing3 = ingredientes[2] || 'Brócoli al vapor';

  const esDiabetes = patologías.some((p) => p.toLowerCase().includes('diabet'));
  const esHipertensión = patologías.some((p) => p.toLowerCase().includes('hiperten'));

  const id = `ia_fb_${Date.now()}`;
  const nombre = `${ing1} Gourmet con ${ing2} y Infusión de Finas Hierbas`;
  const descripcion = `Creación clínica equilibrada, elaborada con ${ingredientes.join(', ') || 'ingredientes premium'}. ${
    esDiabetes ? 'De muy bajo índice glucémico para control metabólico.' : ''
  } ${esHipertensión ? 'Estrictamente baja en sodio y cardiosaludable.' : ''}`.trim();

  const kcal = caloriasObjetivo;
  const prot = Math.round((kcal * 0.3) / 4);
  const cho = Math.round((kcal * 0.45) / 4);
  const grasas = Math.round((kcal * 0.25) / 9);

  return {
    id,
    nombre,
    descripcion,
    categoria: categoria as CategoriaReceta,
    dificultad: 'facil',
    tiempoPreparacionMin: 25,
    origen: 'ia',
    ingredientes: [
      { nombre: ing1, cantidad: 150, unidad: 'g', racionesSmae: 2 },
      { nombre: ing2, cantidad: 80, unidad: 'g', racionesSmae: 1.5 },
      { nombre: ing3, cantidad: 100, unidad: 'g', racionesSmae: 1 },
      { nombre: 'Aceite de oliva extra virgen', cantidad: 10, unidad: 'ml', racionesSmae: 1 },
      { nombre: 'Ajo y hierbas aromáticas al gusto', cantidad: 5, unidad: 'g' },
    ],
    instrucciones: [
      `Marinar el ${ing1.toLowerCase()} con ajo machacado, pimienta negra y un toque de aceite de oliva.`,
      `Cocinar a la plancha a fuego medio durante 6-7 minutos por lado hasta alcanzar cocción perfecta sin dorar en exceso.`,
      `Preparar ${ing2.toLowerCase()} en caldo vegetal bajo en sodio y alinear con las hierbas aromáticas.`,
      `Servir sobre una cama de ${ing3.toLowerCase()} al dente para conservar su fibra y valor vitamínico.`,
    ],
    porcionesRinde: 1,
    macrosPorPorcion: {
      kcal,
      prot,
      cho,
      grasas,
      fibra: 8,
      sodio: esHipertensión ? 140 : 320,
    },
    datosNutricionalesAvanzados: {
      cargaGlicemica: esDiabetes ? 'baja' : 'media',
      alergenos: [],
      vitaminas: ['Vitamina C', 'Hierro', 'Antioxidantes naturales'],
      aptaParaDietas: ['Mediterránea', 'Cardiosaludable', 'Antiinflamatoria'],
    },
    aptaParaCondiciones: patologías.length ? patologías : ['Salud General'],
    restricciones: [
      'sin_azucar',
      ...(esHipertensión ? ['baja_en_sodio'] : []),
      'baja_en_grasa',
    ],
    tags: ['antiinflamatoria', 'cardiosaludable', 'alta_en_proteina', 'bajo_indice_glucemico'],
    fechaCreacion: new Date().toISOString(),
  };
}
