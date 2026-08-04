CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS "El staff puede ver a los pacientes" ON public.users;

CREATE POLICY "El staff puede ver a los usuarios"
ON public.users
FOR SELECT
USING (
  public.get_user_role() IN ('admin', 'especialista', 'staff')
);
