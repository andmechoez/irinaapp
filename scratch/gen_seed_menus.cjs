const fs = require('fs');

let sql = '\n-- MENU TEMPLATES\nTRUNCATE TABLE public.menu_templates;\n';
const menus = JSON.parse(fs.readFileSync('./src/data/menu_templates.json'));
for (const m of menus) {
  const nombre = m.nombre.replace(/'/g, "''");
  const tiempos = JSON.stringify(m.tiempos).replace(/'/g, "''");
  sql += `INSERT INTO public.menu_templates (id, target_kcal, nombre, tiempos) VALUES ('${m.id}', ${m.target_kcal}, '${nombre}', '${tiempos}'::jsonb);\n`;
}

sql += '\n-- SMAE RECORDS\nTRUNCATE TABLE public.smae_records;\n';
const smae = JSON.parse(fs.readFileSync('./src/data/smae.json'));
for (const s of smae) {
  const cat = s.categoria.replace(/'/g, "''");
  const sub = s.subcategoria.replace(/'/g, "''");
  sql += `INSERT INTO public.smae_records (id, categoria, subcategoria, cho, prot, grasas, kcal) VALUES ('${s.id}', '${cat}', '${sub}', ${s.cho}, ${s.prot}, ${s.grasas}, ${s.kcal || 0});\n`;
}

fs.appendFileSync('./supabase/seed.sql', sql);
console.log('Done appending menus and smae to seed.sql.');
