-- Permitir a los administradores insertar nuevas opciones
CREATE POLICY "Admin insert system_options"
  ON public.system_options
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff', 'especialista'))
  );

-- Permitir a los administradores actualizar opciones (ej. desactivarlas o editarlas)
CREATE POLICY "Admin update system_options"
  ON public.system_options
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff', 'especialista'))
  );

-- Permitir a los administradores eliminar opciones
CREATE POLICY "Admin delete system_options"
  ON public.system_options
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff', 'especialista'))
  );
