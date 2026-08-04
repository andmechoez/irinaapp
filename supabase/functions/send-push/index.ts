import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configurar Web Push con las VAPID Keys
// Las llaves deben estar en los secrets de Supabase (VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY)
webpush.setVapidDetails(
  'mailto:soporte@aviva.com',
  Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
  Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
);

serve(async (req) => {
  // Manejo de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { user_id, title, message, url } = body;

    if (!user_id || !title || !message) {
      return new Response(JSON.stringify({ error: 'Faltan parámetros requeridos (user_id, title, message)' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 1. Obtener todas las suscripciones del usuario
    const { data: subscriptions, error: dbError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id);

    if (dbError) throw dbError;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'El usuario no tiene suscripciones push activas.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 2. Enviar la notificación a cada dispositivo
    const payload = JSON.stringify({
      title,
      body: message,
      url: url || '/',
      icon: '/pwa-192x192.png',
      badge: '/favicon.svg'
    });

    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth,
          p256dh: sub.p256dh
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        return { status: 'fulfilled', endpoint: sub.endpoint };
      } catch (err: any) {
        // Si el endpoint expiró (410) o no se encontró (404), lo borramos de la DB
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabaseClient.from('push_subscriptions').delete().eq('id', sub.id);
          return { status: 'deleted', endpoint: sub.endpoint };
        }
        console.error('Error enviando push a', sub.endpoint, err);
        return { status: 'rejected', endpoint: sub.endpoint, error: err.message };
      }
    });

    const results = await Promise.all(sendPromises);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error en send-push:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
