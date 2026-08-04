const fs = require('fs');
const recetas = JSON.parse(fs.readFileSync('./src/data/recetas_sistema.json'));
let sql = 'TRUNCATE TABLE public.recipes;\n\n';
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

  sql += `INSERT INTO public.recipes (id, nombre, descripcion, categoria, dificultad, tiempo_preparacion_min, origen, ingredientes, instrucciones, porciones_rinde, macros_por_porcion, datos_nutricionales_avanzados, apta_para_condiciones, restricciones, tags) VALUES ('${r.id}', '${nombre}', '${desc}', '${r.categoria}', '${r.dificultad}', ${r.tiempoPreparacionMin}, '${r.origen}', '${ingredientes}'::jsonb, '${instrucciones}'::jsonb, ${r.porcionesRinde}, '${macros}'::jsonb, '${adv}'::jsonb, '${apta}'::jsonb, '${rest}'::jsonb, '${tags}'::jsonb);\n`;
}
fs.writeFileSync('./supabase/seed.sql', sql);
console.log('Done generating seed.sql for recetas.');
