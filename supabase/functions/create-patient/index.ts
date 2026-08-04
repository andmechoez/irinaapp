import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { email, password, nombre, apellido, cedula } = await req.json();

    if (!email || !password || !cedula) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 1. Crear usuario en Auth de Supabase usando el Admin API
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar automáticamente para que pueda loguearse con su cédula
      user_metadata: {},   // Prevenir que Supabase deje esto en NULL y arroje Error 500 al hacer login
    });

    if (authError) throw authError;
    const userId = authData.user.id;

    // 2. Insertar en la tabla public.users
    const { error: dbError } = await supabaseClient.from('users').insert({
      id: userId,
      email,
      role: 'paciente',
      nombre,
      apellido,
      is_active: true,
    });

    if (dbError) throw dbError;

    // Para que le llegue el correo de "Confirmación de Email",
    // al usar admin.createUser con email_confirm: false, Supabase envía un correo si la opción "Confirm email" está activa en el Dashboard.
    // Si queremos estar 100% seguros de que llega un correo, también podríamos usar admin.inviteUserByEmail.

    return new Response(JSON.stringify({ userId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
