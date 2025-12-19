// @ts-nocheck
// NOTA: Código Deno - Los errores de TypeScript son solo visuales, el código funciona en Supabase
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') || 'dev-secret-key-change-in-production';
const TOLERANCE_SECONDS = 300;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';

interface WebhookPayload {
  event: string;
  version: string;
  id: string;
  idempotency_key: string;
  timestamp: string;
  data: any;
  metadata: {
    source: string;
    environment: string;
    correlation_id: string;
  };
}

async function verifySignature(
  payload: string,
  signature: string,
  timestamp: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const signedPayload = `${timestamp}.${payload}`;
  
  const key = encoder.encode(WEBHOOK_SECRET);
  const data = encoder.encode(signedPayload);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  
  return computedSignature === signature;
}

function validateTimestamp(timestamp: string): boolean {
  const requestTime = parseInt(timestamp, 10);
  const currentTime = Math.floor(Date.now() / 1000);
  const diff = Math.abs(currentTime - requestTime);
  
  return diff <= TOLERANCE_SECONDS;
}

async function sendNotification(payload: WebhookPayload): Promise<boolean> {
  console.log('\n📧 Enviando notificación...');
  
  if (payload.event === 'enrollment.created') {
    const { student_name, student_email, course_id } = payload.data;
    console.log(`   Destinatario: ${student_name} <${student_email}>`);
    console.log(`   Asunto: Inscripción confirmada al curso ${course_id}`);
    
    if (RESEND_API_KEY) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Plataforma Cursos <onboarding@resend.dev>', // Cambiar por tu dominio verificado
            to: [student_email], // Email dinámico del estudiante desde el payload
            subject: `Inscripción confirmada al curso ${course_id}`,
            html: `
              <h2>¡Bienvenido ${student_name}!</h2>
              <p>Tu inscripción al curso <strong>${course_id}</strong> ha sido confirmada exitosamente.</p>
              <p>Pronto recibirás más información sobre el inicio del curso.</p>
              <hr>
              <p style="color: gray; font-size: 12px;">Este correo fue generado automáticamente por el sistema de webhooks.</p>
            `,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ Correo enviado: ${data.id}`);
          return true;
        } else {
          const error = await response.text();
          console.error(`   ❌ Error enviando correo: ${error}`);
          return false;
        }
      } catch (error) {
        console.error(`   ❌ Error en Resend: ${error}`);
        return false;
      }
    } else {
      console.log(`   ⚠️ RESEND_API_KEY no configurada - Simulación`);
      return true;
    }
    
  } else if (payload.event === 'course.created') {
    const { name, description } = payload.data;
    console.log(`   Notificación: Nuevo curso creado - ${name}`);
    
    if (RESEND_API_KEY) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Plataforma Cursos <onboarding@resend.dev>', // Cambiar por tu dominio verificado
            to: ['joseaalaba8989@gmail.com'], // CAMBIAR POR TU EMAIL REAL DE ADMINISTRADOR
            subject: `Nuevo curso creado: ${name}`,
            html: `
              <h2>Nuevo curso creado</h2>
              <p><strong>Nombre:</strong> ${name}</p>
              <p><strong>Descripción:</strong> ${description}</p>
              <hr>
              <p style="color: gray; font-size: 12px;">Sistema de webhooks - Actividad 2</p>
            `,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ Notificación enviada: ${data.id}`);
          return true;
        } else {
          const error = await response.text();
          console.error(`   ❌ Error: ${error}`);
          return false;
        }
      } catch (error) {
        console.error(`   ❌ Error en Resend: ${error}`);
        return false;
      }
    } else {
      console.log(`   ⚠️ RESEND_API_KEY no configurada - Simulación`);
      return true;
    }
  }
  
  return false;
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const signature = req.headers.get('x-webhook-signature');
    const timestamp = req.headers.get('x-webhook-timestamp');
    const webhookId = req.headers.get('x-webhook-id');
    const idempotencyKey = req.headers.get('x-idempotency-key');

    if (!signature || !timestamp || !webhookId || !idempotencyKey) {
      console.error('❌ Headers faltantes');
      return new Response(
        JSON.stringify({ error: 'Missing required headers' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const body = await req.text();
    const payload: WebhookPayload = JSON.parse(body);

    console.log(`\n📥 Notifier recibió: ${payload.event}`);
    console.log(`   ID: ${webhookId}`);

    if (!validateTimestamp(timestamp)) {
      console.error('❌ Timestamp inválido');
      return new Response(
        JSON.stringify({ error: 'Invalid timestamp' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const isValid = await verifySignature(body, signature, timestamp);
    if (!isValid) {
      console.error('❌ Firma HMAC inválida');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    console.log('✅ Firma HMAC verificada');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: existing } = await supabase
      .from('processed_notifications')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (existing) {
      console.log('⚠️  Notificación ya procesada');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Already sent',
          notification_id: existing.id,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const notificationSent = await sendNotification(payload);

    const { data: savedNotification, error } = await supabase
      .from('processed_notifications')
      .insert({
        webhook_id: webhookId,
        event_type: payload.event,
        idempotency_key: idempotencyKey,
        notification_sent: notificationSent,
        payload_data: payload.data,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal error', message: error instanceof Error ? error.message : 'Unknown error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    console.log(`✅ Notificación procesada: ${savedNotification.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification sent',
        notification_id: savedNotification.id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal error', message: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
