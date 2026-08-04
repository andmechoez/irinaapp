import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Delete existing broken admin if it exists
    const { data: usersData } = await supabaseClient.auth.admin.listUsers();
    const adminUser = usersData.users.find(u => u.email === 'admin@aviva.com');
    if (adminUser) {
      await supabaseClient.auth.admin.deleteUser(adminUser.id);
    }

    // Create the admin user properly using GoTrue API
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: 'admin@aviva.com',
      password: 'aviva123',
      email_confirm: true,
      user_metadata: {}
    });

    if (authError) throw authError;

    // Insert into public.users
    const { error: dbError } = await supabaseClient.from('users').insert({
      id: authData.user.id,
      email: 'admin@aviva.com',
      nombre: 'Administrador',
      apellido: 'Aviva',
      role: 'admin',
      is_active: true
    });

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({ message: 'Admin created successfully', user: authData.user }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
