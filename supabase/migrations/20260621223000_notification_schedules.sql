-- Tabla para programar notificaciones automáticas globales
CREATE TABLE IF NOT EXISTS public.notification_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL,          -- ej. 'agua', 'comida', 'motivacional'
    hora_envio TIME NOT NULL,    -- ej. '10:00:00'
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    url TEXT DEFAULT '/app/dashboard',
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.notification_schedules ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- 1. Solo los usuarios staff/admin pueden gestionar (ver/insertar/modificar) los horarios
CREATE POLICY "Staff can view notification schedules"
ON public.notification_schedules
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'staff', 'especialista')
    )
);

CREATE POLICY "Staff can insert notification schedules"
ON public.notification_schedules
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'staff', 'especialista')
    )
);

CREATE POLICY "Staff can update notification schedules"
ON public.notification_schedules
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'staff', 'especialista')
    )
);

CREATE POLICY "Staff can delete notification schedules"
ON public.notification_schedules
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'staff', 'especialista')
    )
);
