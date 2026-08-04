const fs = require('fs');

// RECETAS
const recetas = JSON.parse(fs.readFileSync('./src/data/recetas_sistema.json'));
let sql = 'TRUNCATE TABLE public.recipes CASCADE;\n\n';
for (const r of recetas) {
  const nombre = r.nombre.replace(/'/g, "''");
  const desc = r.descripcion.replace(/'/g, "''");
  const ingredientes = JSON.stringify(r.ingredientes).replace(/'/g, "''");
  const instrucciones = JSON.stringify(r.instrucciones).replace(/'/g, "''");
  const macros = JSON.stringify(r.macrosPorPorcion || {}).replace(/'/g, "''");
  const adv = JSON.stringify(r.datosNutricionalesAvanzados || {}).replace(/'/g, "''");
  const apta = JSON.stringify(r.aptaParaCondiciones || []).replace(/'/g, "''");
  const rest = JSON.stringify(r.restricciones || []).replace(/'/g, "''");
  const tags = JSON.stringify(r.tags || []).replace(/'/g, "''");

  sql += `INSERT INTO public.recipes (nombre, descripcion, categoria, dificultad, tiempo_preparacion_min, origen, ingredientes, instrucciones, porciones_rinde, macros_por_porcion, datos_nutricionales_avanzados, apta_para_condiciones, restricciones, tags) VALUES ('${nombre}', '${desc}', '${r.categoria}', '${r.dificultad}', ${r.tiempoPreparacionMin}, '${r.origen}', '${ingredientes}'::jsonb, '${instrucciones}'::jsonb, ${r.porcionesRinde}, '${macros}'::jsonb, '${adv}'::jsonb, '${apta}'::jsonb, '${rest}'::jsonb, '${tags}'::jsonb);\n`;
}

// MENU TEMPLATES
sql += '\n-- MENU TEMPLATES\nTRUNCATE TABLE public.menu_templates CASCADE;\n';
const menus = JSON.parse(fs.readFileSync('./src/data/menu_templates.json'));
for (const m of menus) {
  const nombre = m.nombre.replace(/'/g, "''");
  const tiempos = JSON.stringify(m.tiempos).replace(/'/g, "''");
  sql += `INSERT INTO public.menu_templates (target_kcal, nombre, tiempos) VALUES (${m.target_kcal}, '${nombre}', '${tiempos}'::jsonb);\n`;
}

// SMAE RECORDS
sql += '\n-- SMAE RECORDS\nTRUNCATE TABLE public.smae_records CASCADE;\n';
const smae = JSON.parse(fs.readFileSync('./src/data/smae.json'));
for (const s of smae) {
  const cat = s.categoria.replace(/'/g, "''");
  const sub = s.subcategoria.replace(/'/g, "''");
  sql += `INSERT INTO public.smae_records (categoria, subcategoria, cho, prot, grasas, kcal) VALUES ('${cat}', '${sub}', ${s.cho}, ${s.prot}, ${s.grasas}, ${s.kcal || 0});\n`;
}

fs.writeFileSync('./supabase/seed.sql', sql);
console.log('Done generating seed.sql without IDs.');
