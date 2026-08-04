-- Create the clinical_content table
CREATE TABLE IF NOT EXISTS public.clinical_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('reto', 'recomendacion', 'rutina')),
  title text NOT NULL,
  description text NOT NULL,
  icon text,
  trigger_condition text,
  trigger_objective text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.clinical_content ENABLE ROW LEVEL SECURITY;

-- Admins can do anything
CREATE POLICY "Admins can manage clinical_content"
  ON public.clinical_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Everyone (authenticated users) can read active clinical content
CREATE POLICY "Authenticated users can read active clinical content"
  ON public.clinical_content
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND is_active = true
  );

-- Insert initial bulk data
-- As requested: minimum 10 per situation (Hipertensión, Diabetes 1, Diabetes 2, Dislipidemia, General)
INSERT INTO public.clinical_content (type, title, description, icon, trigger_condition, trigger_objective) VALUES
-- HIPERTENSIÓN (10 Retos/Recomendaciones)
('reto', 'Día sin salero en la mesa', 'Evita poner el salero en la mesa y usa hierbas para sazonar tus alimentos de hoy.', '🧂', 'Hipertensión', null),
('reto', 'Agua de Jamaica natural', 'Prepara agua de Jamaica sin azúcar hoy, te ayudará a la presión arterial.', '🌺', 'Hipertensión', null),
('recomendacion', 'Ajo en tus comidas', 'El ajo tiene propiedades que ayudan a relajar los vasos sanguíneos. Agrégalo fresco hoy.', '🧄', 'Hipertensión', null),
('reto', 'Descanso consciente', 'Realiza 5 minutos de respiración profunda en silencio para bajar el estrés.', '🧘', 'Hipertensión', null),
('reto', 'Aumenta el potasio', 'Consume una porción extra de alimentos ricos en potasio como espinaca, aguacate o plátano.', '🥑', 'Hipertensión', null),
('recomendacion', 'Cuidado con los enlatados', 'Revisa las etiquetas hoy y evita comprar o consumir alimentos enlatados por su alto sodio.', '🥫', 'Hipertensión', null),
('reto', 'Caminata relajante', 'Realiza una caminata ligera de 20 minutos hoy por la tarde para mejorar la circulación.', '🚶', 'Hipertensión', null),
('reto', 'Cambia tu snack', 'Sustituye cualquier snack salado empacado por un puñado de nueces sin sal.', '🥜', 'Hipertensión', null),
('recomendacion', 'Lácteos descremados', 'Prefiere hoy consumir lácteos bajos en grasa para ayudar a controlar tu presión.', '🥛', 'Hipertensión', null),
('reto', 'Monitoreo preventivo', 'Mide tu presión arterial hoy en reposo y anota el resultado.', '🩺', 'Hipertensión', null),

-- DIABETES 1 & 2 (10 Retos/Recomendaciones)
('reto', 'Caminata post-comida', 'Camina 10 minutos adicionales inmediatamente después de tu comida principal.', '🏃', 'Diabetes 2', null),
('reto', 'Caminata post-comida', 'Camina 10 minutos adicionales inmediatamente después de tu comida principal.', '🏃', 'Diabetes 1', null),
('reto', 'Revisa tus pies', 'Tómate 3 minutos esta noche para hidratar y revisar la planta de tus pies.', '👣', 'Diabetes 2', null),
('reto', 'Revisa tus pies', 'Tómate 3 minutos esta noche para hidratar y revisar la planta de tus pies.', '👣', 'Diabetes 1', null),
('recomendacion', 'Verduras primero', 'En tu almuerzo de hoy, come primero los vegetales, luego la proteína y al final los carbohidratos.', '🥗', 'Diabetes 2', null),
('recomendacion', 'Verduras primero', 'En tu almuerzo de hoy, come primero los vegetales, luego la proteína y al final los carbohidratos.', '🥗', 'Diabetes 1', null),
('reto', 'Cambia el postre', 'Evita hoy el postre dulce y cámbialo por una taza de gelatina sin azúcar o media taza de frutos rojos.', '🍓', 'Diabetes 2', null),
('reto', 'Snack de bajo índice', 'Si tienes hambre entre comidas, come almendras en lugar de galletas.', '🌰', 'Diabetes 2', null),
('recomendacion', 'Té de canela', 'Bebe una taza de té de canela natural sin endulzar; estudios sugieren que mejora la sensibilidad a la insulina.', '☕', 'Diabetes 2', null),
('recomendacion', 'Monitoreo de glucosa', 'Si tienes medidor, revisa tu glucosa en ayunas y anótala en tu registro.', '🩸', 'Diabetes 1', null),
('reto', 'Agua antes de las comidas', 'Toma un vaso de agua 15 minutos antes de tus comidas fuertes.', '💧', 'Diabetes 2', null),
('reto', 'Día sin jugos', 'Evita completamente jugos (incluso naturales). Consume la fruta entera para aprovechar la fibra.', '🍎', 'Diabetes 2', null),
('recomendacion', 'Vinagre de manzana', 'Añade 1 cucharada de vinagre de manzana a tu ensalada hoy para evitar picos de glucosa.', '🍏', 'Diabetes 2', null),
('reto', 'Día de fibra extra', 'Asegúrate de comer al menos dos tazas de vegetales fibrosos hoy.', '🥦', 'Diabetes 1', null),

-- DISLIPIDEMIA (Colesterol/Triglicéridos) (10 Retos/Recomendaciones)
('reto', 'Día de pescado', 'Incluye hoy en tu dieta una porción de pescado rico en Omega 3.', '🐟', 'Dislipidemia', null),
('recomendacion', 'Semillas de chía', 'Añade una cucharada de chía a tu bebida o yogur para aportar fibra soluble.', '🌱', 'Dislipidemia', null),
('reto', 'Cero frituras', 'Hoy no consumas absolutamente nada que haya sido frito en aceite.', '🍟', 'Dislipidemia', null),
('recomendacion', 'Aguacate tu aliado', 'Usa medio aguacate como sustituto de mayonesa o crema en tu almuerzo.', '🥑', 'Dislipidemia', null),
('reto', 'Avena en el desayuno', 'Inicia tu día con una porción de avena integral preparada con agua.', '🥣', 'Dislipidemia', null),
('reto', 'Día sin embutidos', 'Evita salchichas, jamón o tocino durante todo el día de hoy.', '🚫', 'Dislipidemia', null),
('recomendacion', 'Té verde', 'Bebe una o dos tazas de té verde hoy para aprovechar sus antioxidantes.', '🍵', 'Dislipidemia', null),
('reto', 'Aceite de oliva en crudo', 'Usa una cucharadita de aceite de oliva extra virgen en tu ensalada, sin cocinarlo.', '🫒', 'Dislipidemia', null),
('reto', 'Movimiento activo', 'Realiza 30 minutos de ejercicio cardiovascular moderado hoy.', '🚴', 'Dislipidemia', null),
('recomendacion', 'Leguminosas', 'Incluye una porción de lentejas o frijoles en tu almuerzo; su fibra arrastra el colesterol.', '🍲', 'Dislipidemia', null),

-- OBJETIVO: PERDER GRASA (10 Retos/Recomendaciones)
('reto', 'Ayuno de 12 horas', 'Cena temprano hoy y desayuna 12 horas después para dar descanso a tu digestión.', '⏱️', null, 'perder_grasa'),
('recomendacion', 'Mastica despacio', 'Mastica cada bocado al menos 20 veces hoy. La saciedad tarda 20 minutos en llegar al cerebro.', '🧠', null, 'perder_grasa'),
('reto', 'Mitad de plato verde', 'Asegúrate de que la mitad de tu plato en la comida y cena sean vegetales.', '🥗', null, 'perder_grasa'),
('reto', 'Cero azúcar líquida', 'Hoy está prohibido consumir bebidas que contengan azúcar añadida.', '🥤', null, 'perder_grasa'),
('recomendacion', 'Proteína en el desayuno', 'Incluye una fuente fuerte de proteína en tu desayuno de hoy para controlar el apetito todo el día.', '🍳', null, 'perder_grasa'),
('reto', '10 mil pasos', 'Intenta llegar hoy a tu meta de 10,000 pasos en el día.', '👟', null, 'perder_grasa'),
('reto', 'Sueño reparador', 'Intenta irte a la cama 30 minutos antes hoy; la falta de sueño detiene la pérdida de grasa.', '🛌', null, 'perder_grasa'),
('recomendacion', 'Snack inteligente', 'Si da hambre a media tarde, toma agua mineral o té caliente antes de buscar comida.', '☕', null, 'perder_grasa'),
('reto', 'Día sin harinas blancas', 'Sustituye hoy todo el pan blanco o pasta por opciones integrales o tubérculos.', '🥖', null, 'perder_grasa'),
('reto', 'Suda un poco', 'Realiza una actividad que eleve tu ritmo cardíaco y te haga sudar hoy.', '💦', null, 'perder_grasa'),

-- GENERAL (Para todos - 10 Retos/Recomendaciones)
('reto', 'Hidratación óptima', 'Bebe un vaso grande de agua al despertar y antes de cada comida fuerte hoy.', '💧', null, null),
('recomendacion', 'Agradecimiento', 'Escribe 3 cosas por las que estás agradecido sobre tu salud hoy.', '📝', null, null),
('reto', 'Estiramiento matutino', 'Dedica 5 minutos a estirar tus músculos apenas te levantes de la cama.', '🤸', null, null),
('reto', 'Pantallas apagadas', 'Desconecta tu celular 1 hora antes de irte a dormir.', '📱', null, null),
('recomendacion', 'Contacto con el sol', 'Toma 10 minutos de luz solar directa en la mañana para mejorar tu ciclo circadiano.', '☀️', null, null),
('reto', 'Sonrisa consciente', 'Sonríe a propósito frente al espejo por 30 segundos hoy para engañar a tu cerebro y producir endorfinas.', '😊', null, null),
('reto', 'Postura correcta', 'Revisa tu postura cada vez que te sientes a trabajar hoy.', '🪑', null, null),
('recomendacion', 'Variedad de colores', 'Intenta que tu plato fuerte de hoy tenga al menos 3 colores naturales distintos.', '🌈', null, null),
('reto', 'Cocina en casa', 'Hoy prepárate al menos una de tus comidas completamente desde cero, sin nada procesado.', '👨‍🍳', null, null),
('reto', 'Día de la fruta nueva', 'Prueba una fruta que usualmente no compras en el supermercado.', '🥝', null, null);
