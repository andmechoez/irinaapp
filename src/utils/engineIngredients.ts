import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fileLocation = path.join(__dirname, 'TCA Jordi Cruz.xlsx');

// Función para cargar variables de entorno desde el archivo .env manualmente
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value.trim();
        }
      });
    }
  } catch (error) {
    console.error('Error cargando el archivo .env:', error);
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

interface Ingrediente {
  id: string;
  nombre: string;
  proteinas: number | null;
  carbohidratos: number | null;
  grasas: number | null;
  calorias: number;
}

function LeerIngredientes(filePath: string): Ingrediente[] {
  const workbook = XLSX.read(filePath, { type: 'file' });
  const sheetName = workbook.SheetNames[1]; // Segunda pestaña
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet) as any[];

  return data.map((row: any) => {
    const cleanName = (row['Alimento'] || '')
      .replace(/,/g, '')
      .replace(/\r?\n|\r/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      id: crypto.randomUUID(),
      nombre: cleanName,
      // Mapear undefined/null a null para evitar problemas en Postgres
      proteinas: typeof row['Proteína (g)'] === 'number' ? row['Proteína (g)'] : null,
      carbohidratos: typeof row['Carbohidratos (g)'] === 'number' ? row['Carbohidratos (g)'] : null,
      grasas: typeof row['Grasa total (g)'] === 'number' ? row['Grasa total (g)'] : null,
      calorias: typeof row['Energía calculada (Kcal)'] === 'number' ? row['Energía calculada (Kcal)'] : 0,
    };
  });
}

async function cargarEnBaseDeDatos() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: No se encontraron las credenciales de Supabase en el archivo .env');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('📖 Leyendo ingredientes del archivo Excel...');
  const ingredientes = LeerIngredientes(fileLocation);
  console.log(`✅ Se leyeron ${ingredientes.length} ingredientes.`);

  // Detectar el nombre correcto de la tabla (incluyendo posibles erratas como Ingrendientes)
  let TABLA = '';
  const posiblesTablas = ['Ingrendientes', 'ingrendientes', 'Ingredientes', 'ingredientes', 'ingredients'];
  
  console.log('📡 Detectando nombre de la tabla en Supabase...');
  for (const nombre of posiblesTablas) {
    const { error } = await supabase.from(nombre).select('*').limit(1);
    if (!error) {
      TABLA = nombre;
      break;
    }
  }

  if (!TABLA) {
    console.error('❌ Error: No se encontró la tabla "Ingrendientes", "Ingredientes", "ingredientes" o "ingredients" en el schema cache de Supabase.');
    console.log('💡 Sugerencia: Si acabas de crear la tabla, asegúrate de que esté en el esquema "public" y de que tenga políticas RLS creadas (ej. permitir lecturas públicas y de inserción). A veces Supabase tarda unos segundos en refrescar la caché.');
    return;
  }

  console.log(`📡 Tabla detectada con éxito: "${TABLA}"`);
  console.log(`🚀 Iniciando la carga de ingredientes en la tabla "${TABLA}"...`);
  
  // Realizar inserciones en bloques (batches) de 100 para optimizar el rendimiento y evitar límites
  const BATCH_SIZE = 100;
  let totalInsertados = 0;

  for (let i = 0; i < ingredientes.length; i += BATCH_SIZE) {
    const batch = ingredientes.slice(i, i + BATCH_SIZE);
    
    const { error } = await supabase
      .from(TABLA)
      .insert(batch);

    if (error) {
      console.error(`❌ Error insertando lote del índice ${i} al ${i + batch.length}:`, error.message);
      console.log('💡 Sugerencia: Asegúrate de que la tabla "Ingredientes" exista en Supabase con las columnas correspondientes y que tenga una política de escritura (RLS) habilitada o desactivada.');
      return;
    }

    totalInsertados += batch.length;
    console.log(`⏳ Progreso: ${totalInsertados}/${ingredientes.length} insertados...`);
  }

  console.log('🎉 ¡Carga completada con éxito!');
}

cargarEnBaseDeDatos();