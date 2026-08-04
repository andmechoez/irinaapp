-- 1. Función auxiliar de seguridad para evitar la recursión infinita al validar roles
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- 2. Asegurar RLS en la tabla users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas antiguas
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.users;
DROP POLICY IF EXISTS "El staff puede ver a los pacientes" ON public.users;
DROP POLICY IF EXISTS "El staff puede ver a los usuarios" ON public.users;
DROP POLICY IF EXISTS "El staff y admin pueden ver a todos los usuarios" ON public.users;
DROP POLICY IF EXISTS "Admins o usuarios pueden insertar en users" ON public.users;
DROP POLICY IF EXISTS "Admins o usuarios pueden actualizar users" ON public.users;
DROP POLICY IF EXISTS "Admins pueden eliminar users" ON public.users;

-- 3. Permitir lectura a staff y admin
CREATE POLICY "El staff y admin pueden ver a todos los usuarios"
ON public.users
FOR SELECT
USING (
  auth.uid() = id OR public.get_user_role() IN ('admin', 'especialista', 'staff', 'asistente')
);

-- 4. Permitir INSERT a administradores
CREATE POLICY "Admins o usuarios pueden insertar en users"
ON public.users
FOR INSERT
WITH CHECK (
  public.get_user_role() = 'admin' OR auth.uid() = id
);

-- 5. Permitir UPDATE a administradores o al propio usuario
CREATE POLICY "Admins o usuarios pueden actualizar users"
ON public.users
FOR UPDATE
USING (
  public.get_user_role() = 'admin' OR auth.uid() = id
);

-- 6. Permitir DELETE a administradores
CREATE POLICY "Admins pueden eliminar users"
ON public.users
FOR DELETE
USING (
  public.get_user_role() = 'admin'
);
