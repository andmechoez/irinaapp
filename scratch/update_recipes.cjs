const fs = require('fs');

const path = './src/data/recetas_sistema.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Update existing
data.forEach(receta => {
  const isVegan = !receta.ingredientes.some(i => i.smae_id && (i.smae_id.includes('carnes') || i.smae_id.includes('lacteos') || i.smae_id.includes('pescado')));
  const isVegetarian = !receta.ingredientes.some(i => i.smae_id && i.smae_id.includes('carnes'));
  
  receta.datosNutricionalesAvanzados = {
    cargaGlicemica: receta.tags.includes('bajo_indice_glucemico') ? 'baja' : 'media',
    alergenos: [],
    vitaminas: [],
    aptaParaDietas: []
  };

  if (receta.restricciones.includes('sin_gluten') === false && receta.ingredientes.some(i => i.nombre.toLowerCase().includes('pan') || i.nombre.toLowerCase().includes('tortilla de harina') || i.nombre.toLowerCase().includes('avena'))) {
    receta.datosNutricionalesAvanzados.alergenos.push('Gluten');
  }
  if (receta.restricciones.includes('sin_lactosa') === false && receta.ingredientes.some(i => i.nombre.toLowerCase().includes('leche') || i.nombre.toLowerCase().includes('queso') || i.nombre.toLowerCase().includes('yogur'))) {
    receta.datosNutricionalesAvanzados.alergenos.push('Lácteos');
  }
  if (receta.ingredientes.some(i => i.nombre.toLowerCase().includes('nuez') || i.nombre.toLowerCase().includes('almendra') || i.nombre.toLowerCase().includes('cacahuate'))) {
    receta.datosNutricionalesAvanzados.alergenos.push('Nueces/Cacahuates');
  }
  if (receta.ingredientes.some(i => i.nombre.toLowerCase().includes('huevo') || i.nombre.toLowerCase().includes('claras'))) {
    receta.datosNutricionalesAvanzados.alergenos.push('Huevo');
  }
  if (receta.ingredientes.some(i => i.nombre.toLowerCase().includes('pescado') || i.nombre.toLowerCase().includes('salmón') || i.nombre.toLowerCase().includes('atún'))) {
    receta.datosNutricionalesAvanzados.alergenos.push('Pescado');
  }

  if (isVegan) receta.datosNutricionalesAvanzados.aptaParaDietas.push('Vegana');
  if (isVegetarian) receta.datosNutricionalesAvanzados.aptaParaDietas.push('Vegetariana');
  
  if (receta.tags.includes('rica_en_hierro')) receta.datosNutricionalesAvanzados.vitaminas.push('Hierro');
  if (receta.tags.includes('rica_en_calcio')) receta.datosNutricionalesAvanzados.vitaminas.push('Calcio');
  if (receta.tags.includes('rica_en_omega3')) receta.datosNutricionalesAvanzados.vitaminas.push('Omega 3');
  if (receta.ingredientes.some(i => i.nombre.toLowerCase().includes('limón') || i.nombre.toLowerCase().includes('naranja') || i.nombre.toLowerCase().includes('fresa') || i.nombre.toLowerCase().includes('tomate'))) {
    receta.datosNutricionalesAvanzados.vitaminas.push('Vitamina C');
  }
});

// Add 5 new recipes
const nuevasRecetas = [
  {
    "id": "rec_021",
    "nombre": "Pizza Keto con Base de Coliflor",
    "descripcion": "Pizza baja en carbohidratos, excelente para dieta cetogénica y diabéticos.",
    "categoria": "cena",
    "dificultad": "media",
    "tiempoPreparacionMin": 35,
    "origen": "sistema",
    "ingredientes": [
      { "nombre": "Coliflor rallada", "cantidad": 150, "unidad": "g", "smae_id": "vegetales_bajos_cho", "racionesSmae": 2 },
      { "nombre": "Queso mozzarella bajo en grasa", "cantidad": 50, "unidad": "g", "smae_id": "carnes_bajas_grasas", "racionesSmae": 1.5 },
      { "nombre": "Huevo", "cantidad": 1, "unidad": "pieza", "smae_id": "carnes_medias_grasas", "racionesSmae": 1 },
      { "nombre": "Salsa de tomate casera", "cantidad": 30, "unidad": "ml", "smae_id": "vegetales_bajos_cho", "racionesSmae": 0.5 },
      { "nombre": "Champiñones y espinaca", "cantidad": 50, "unidad": "g", "smae_id": "vegetales_libre", "racionesSmae": 1 }
    ],
    "instrucciones": [
      "Exprime bien la coliflor rallada para quitar todo el líquido.",
      "Mezcla la coliflor con medio huevo y la mitad del queso para formar la masa.",
      "Extiende en una charola y hornea a 200°C por 15 min hasta que dore.",
      "Agrega la salsa, el resto del queso y los vegetales.",
      "Hornea 10 minutos más."
    ],
    "porcionesRinde": 1,
    "macrosPorPorcion": { "kcal": 280, "cho": 12, "prot": 22, "grasas": 16, "fibra": 5, "sodio": 350 },
    "aptaParaCondiciones": ["Diabetes 1", "Diabetes 2", "SOP", "Osteoporosis/artrosis"],
    "restricciones": ["sin_gluten", "sin_azucar"],
    "tags": ["bajo_indice_glucemico", "horneado", "alta_en_proteina"],
    "fechaCreacion": "2026-06-19",
    "datosNutricionalesAvanzados": {
      "cargaGlicemica": "baja",
      "alergenos": ["Lácteos", "Huevo"],
      "vitaminas": ["Calcio", "Vitamina C"],
      "aptaParaDietas": ["Keto", "Vegetariana"]
    }
  },
  {
    "id": "rec_022",
    "nombre": "Filete de Pescado Empapelado con Vegetales",
    "descripcion": "Comida muy baja en grasa y fácil de digerir. Ideal para gastritis.",
    "categoria": "almuerzo",
    "dificultad": "facil",
    "tiempoPreparacionMin": 25,
    "origen": "sistema",
    "ingredientes": [
      { "nombre": "Filete de pescado blanco", "cantidad": 120, "unidad": "g", "smae_id": "carnes_bajas_grasas", "racionesSmae": 3 },
      { "nombre": "Calabacita en rodajas", "cantidad": 80, "unidad": "g", "smae_id": "vegetales_bajos_cho", "racionesSmae": 1 },
      { "nombre": "Zanahoria en rodajas finas", "cantidad": 40, "unidad": "g", "smae_id": "vegetales_bajos_cho", "racionesSmae": 0.5 },
      { "nombre": "Arroz blanco cocido", "cantidad": 40, "unidad": "g", "smae_id": "cereales_altos_cho_bajos_grasas", "racionesSmae": 1 },
      { "nombre": "Aceite de oliva", "cantidad": 5, "unidad": "ml", "smae_id": "grasas_altas_grasas", "racionesSmae": 0.5 }
    ],
    "instrucciones": [
      "Sobre papel aluminio, coloca una capa de vegetales.",
      "Pon el filete de pescado encima y rocía con el aceite de oliva, sal (poca) y hierbas finas.",
      "Cierra el papel aluminio formando un paquete hermético.",
      "Cocina en un sartén o comal a fuego medio-bajo por 15 minutos.",
      "Sirve acompañado del arroz blanco."
    ],
    "porcionesRinde": 1,
    "macrosPorPorcion": { "kcal": 280, "cho": 22, "prot": 30, "grasas": 8, "fibra": 3, "sodio": 120 },
    "aptaParaCondiciones": ["Gastritis", "Hipertensión", "Dislipidemia"],
    "restricciones": ["sin_lactosa", "sin_gluten", "baja_en_grasa", "baja_en_sodio"],
    "tags": ["dieta_blanda", "facil_digestion", "alta_en_proteina"],
    "fechaCreacion": "2026-06-19",
    "datosNutricionalesAvanzados": {
      "cargaGlicemica": "baja",
      "alergenos": ["Pescado"],
      "vitaminas": ["Omega 3"],
      "aptaParaDietas": ["Pescatariana"]
    }
  },
  {
    "id": "rec_023",
    "nombre": "Ensalada de Lentejas Mediterránea",
    "descripcion": "Almuerzo vegano rico en hierro y fibra. Control cardiovascular.",
    "categoria": "almuerzo",
    "dificultad": "facil",
    "tiempoPreparacionMin": 15,
    "origen": "sistema",
    "ingredientes": [
      { "nombre": "Lentejas cocidas", "cantidad": 120, "unidad": "g", "smae_id": "leguminosas", "racionesSmae": 2 },
      { "nombre": "Tomate cherry", "cantidad": 60, "unidad": "g", "smae_id": "vegetales_bajos_cho", "racionesSmae": 1 },
      { "nombre": "Pepino picado", "cantidad": 50, "unidad": "g", "smae_id": "vegetales_libre", "racionesSmae": 1 },
      { "nombre": "Aceitunas negras", "cantidad": 20, "unidad": "g", "smae_id": "grasas_altas_grasas", "racionesSmae": 1 },
      { "nombre": "Aceite de oliva y limón", "cantidad": 5, "unidad": "ml", "smae_id": "grasas_altas_grasas", "racionesSmae": 0.5 }
    ],
    "instrucciones": [
      "En un bowl grande mezcla las lentejas cocidas (frías) con el pepino y tomate.",
      "Agrega las aceitunas rebanadas.",
      "Prepara una vinagreta sencilla con aceite de oliva, jugo de limón, sal y pimienta.",
      "Mezcla todo y deja reposar 5 minutos antes de comer."
    ],
    "porcionesRinde": 1,
    "macrosPorPorcion": { "kcal": 310, "cho": 38, "prot": 14, "grasas": 12, "fibra": 14, "sodio": 200 },
    "aptaParaCondiciones": ["Diabetes 2", "Dislipidemia", "Hipertensión"],
    "restricciones": ["sin_lactosa", "sin_gluten", "baja_en_grasa"],
    "tags": ["alta_en_fibra", "rica_en_hierro", "cardiosaludable", "rapida"],
    "fechaCreacion": "2026-06-19",
    "datosNutricionalesAvanzados": {
      "cargaGlicemica": "baja",
      "alergenos": [],
      "vitaminas": ["Hierro", "Vitamina C"],
      "aptaParaDietas": ["Vegana", "Vegetariana", "Mediterránea"]
    }
  },
  {
    "id": "rec_024",
    "nombre": "Muffins de Huevo y Espinaca",
    "descripcion": "Desayuno rápido preparado con anticipación. Perfecto para llevar.",
    "categoria": "desayuno",
    "dificultad": "facil",
    "tiempoPreparacionMin": 25,
    "origen": "sistema",
    "ingredientes": [
      { "nombre": "Huevo", "cantidad": 2, "unidad": "piezas", "smae_id": "carnes_medias_grasas", "racionesSmae": 2 },
      { "nombre": "Espinaca picada", "cantidad": 40, "unidad": "g", "smae_id": "vegetales_bajos_cho", "racionesSmae": 0.5 },
      { "nombre": "Queso panela rallado", "cantidad": 20, "unidad": "g", "smae_id": "carnes_bajas_grasas", "racionesSmae": 0.5 },
      { "nombre": "Avena en polvo", "cantidad": 15, "unidad": "g", "smae_id": "cereales_medios_cho_bajos_grasas", "racionesSmae": 0.5 }
    ],
    "instrucciones": [
      "Precalienta el horno a 180°C y engrasa moldes para muffin.",
      "Bate los huevos y mezcla con la avena, espinaca y queso.",
      "Vierte la mezcla en 2 o 3 capacillos.",
      "Hornea por 15-20 minutos hasta que estén dorados y firmes."
    ],
    "porcionesRinde": 1,
    "macrosPorPorcion": { "kcal": 240, "cho": 12, "prot": 20, "grasas": 13, "fibra": 3, "sodio": 250 },
    "aptaParaCondiciones": ["SOP", "Osteoporosis/artrosis", "Diabetes 2"],
    "restricciones": ["sin_gluten"],
    "tags": ["alta_en_proteina", "horneado", "rapida"],
    "fechaCreacion": "2026-06-19",
    "datosNutricionalesAvanzados": {
      "cargaGlicemica": "baja",
      "alergenos": ["Huevo", "Lácteos"],
      "vitaminas": ["Calcio", "Hierro"],
      "aptaParaDietas": ["Vegetariana"]
    }
  },
  {
    "id": "rec_025",
    "nombre": "Té de Manzanilla con Jengibre",
    "descripcion": "Bebida relajante y digestiva. Excelente antes de dormir o para gastritis.",
    "categoria": "bebida",
    "dificultad": "facil",
    "tiempoPreparacionMin": 10,
    "origen": "sistema",
    "ingredientes": [
      { "nombre": "Flores de manzanilla o bolsita", "cantidad": 1, "unidad": "sobre" },
      { "nombre": "Jengibre fresco en rodajas", "cantidad": 5, "unidad": "g" },
      { "nombre": "Agua", "cantidad": 250, "unidad": "ml" }
    ],
    "instrucciones": [
      "Hierve el agua junto con las rodajas de jengibre por 5 minutos.",
      "Apaga el fuego, agrega la manzanilla y deja reposar 3 minutos tapado.",
      "Cuela y sirve caliente. No agregar azúcar."
    ],
    "porcionesRinde": 1,
    "macrosPorPorcion": { "kcal": 5, "cho": 1, "prot": 0, "grasas": 0, "fibra": 0, "sodio": 0 },
    "aptaParaCondiciones": ["Gastritis", "Artritis", "Hipertensión", "Diabetes 1", "Diabetes 2", "SOP"],
    "restricciones": ["sin_lactosa", "sin_gluten", "sin_azucar", "baja_en_sodio"],
    "tags": ["antiinflamatoria", "reconfortante", "facil_digestion", "sin_calorias"],
    "fechaCreacion": "2026-06-19",
    "datosNutricionalesAvanzados": {
      "cargaGlicemica": "baja",
      "alergenos": [],
      "vitaminas": [],
      "aptaParaDietas": ["Vegana", "Vegetariana", "Keto", "Mediterránea"]
    }
  }
];

data.push(...nuevasRecetas);

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Done modifying recipes');
