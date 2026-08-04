-- Tabla para almacenar suscripciones Push de los usuarios (dispositivos)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    endpoint TEXT NOT NULL UNIQUE, -- URL del push service
    auth TEXT NOT NULL,            -- Clave auth de Web Push
    p256dh TEXT NOT NULL,          -- Clave pública P-256 de Web Push
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- 1. Un usuario (paciente o admin) puede ver sus propias suscripciones
CREATE POLICY "Users can view their own push subscriptions" 
ON public.push_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Un usuario puede insertar sus propias suscripciones
CREATE POLICY "Users can insert their own push subscriptions" 
ON public.push_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Un usuario puede borrar sus propias suscripciones (ej. si desactiva notificaciones)
CREATE POLICY "Users can delete their own push subscriptions" 
ON public.push_subscriptions 
FOR DELETE 
USING (auth.uid() = user_id);

-- El Service Role (Edge Functions) ignora RLS, así que podrá leer todas para enviar los push.
