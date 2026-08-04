import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Asumimos zona horaria de Ecuador/Colombia/Perú por defecto (-5)
const TIMEZONE_OFFSET = -5; 

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Determinar hora actual en la zona horaria destino
    const nowUtc = new Date();
    const localNow = new Date(nowUtc.getTime() + TIMEZONE_OFFSET * 60 * 60 * 1000);
    
    const currentHour = localNow.getUTCHours();
    const currentMinute = localNow.getUTCMinutes();

    // Redondear al bloque de 15 minutos más cercano hacia abajo
    const blockMinute = Math.floor(currentMinute / 15) * 15;
    
    const timeString = `${currentHour.toString().padStart(2, '0')}:${blockMinute.toString().padStart(2, '0')}:00`;
    console.log('Verificando schedules para hora local:', timeString);

    // 2. Buscar schedules activos para este bloque de tiempo
    const { data: schedules, error: scheduleError } = await supabaseClient
      .from('notification_schedules')
      .select('*')
      .eq('is_active', true)
      .eq('hora_envio', timeString);

    if (scheduleError) throw scheduleError;

    if (!schedules || schedules.length === 0) {
      return new Response(JSON.stringify({ message: 'No hay notificaciones programadas para esta hora.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 3. Obtener todos los pacientes activos
    const { data: patients, error: patientsError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('role', 'paciente')
      .eq('is_active', true);

    if (patientsError) throw patientsError;

    let totalSent = 0;

    // 4. Para cada schedule, enviar a todos los pacientes
    for (const schedule of schedules) {
      for (const patient of patients) {
        // Invocamos la función send-push internamente
        const { error: invokeError } = await supabaseClient.functions.invoke('send-push', {
          body: {
            user_id: patient.id,
            title: schedule.titulo,
            message: schedule.mensaje,
            url: schedule.url
          }
        });

        if (invokeError) {
          console.error(`Error enviando schedule ${schedule.id} al paciente ${patient.id}`, invokeError);
        } else {
          totalSent++;
        }
      }
    }

    return new Response(JSON.stringify({ success: true, processedSchedules: schedules.length, totalPushesTriggered: totalSent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error en process-schedules:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
