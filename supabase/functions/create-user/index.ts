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
    const { email, password, nombre, apellido, role = 'staff', especialidad, telefono } = await req.json();

    if (!email || !password || !nombre) {
      return new Response(JSON.stringify({ error: 'Email, contraseña y nombre son campos requeridos' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 1. Crear usuario en Auth de Supabase usando el Admin API
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, nombre, apellido },
    });

    if (authError) throw authError;
    const userId = authData.user.id;

    // 2. Insertar en la tabla public.users
    const { error: dbError } = await supabaseClient.from('users').insert({
      id: userId,
      email,
      role: role || 'staff',
      nombre,
      apellido: apellido || null,
      especialidad: especialidad || null,
      telefono: telefono || null,
      is_active: true,
    });

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ userId, success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
