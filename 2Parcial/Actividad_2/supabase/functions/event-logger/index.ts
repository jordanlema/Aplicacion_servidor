// @ts-nocheck
// NOTA: Código Deno - Los errores de TypeScript son solo visuales, el código funciona en Supabase
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') || 'dev-secret-key-change-in-production';
const TOLERANCE_SECONDS = 300; 

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

/**
 * Verifica la firma HMAC del webhook
 */
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

/**
 * Valida el timestamp para prevenir replay attacks
 */
function validateTimestamp(timestamp: string): boolean {
  const requestTime = parseInt(timestamp, 10);
  const currentTime = Math.floor(Date.now() / 1000);
  const diff = Math.abs(currentTime - requestTime);
  
  return diff <= TOLERANCE_SECONDS;
}

serve(async (req: Request) => {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    // Extraer headers
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

    // Leer body
    const body = await req.text();
    const payload: WebhookPayload = JSON.parse(body);

    console.log(`\n📥 Webhook recibido: ${payload.event}`);
    console.log(`   ID: ${webhookId}`);
    console.log(`   Idempotency Key: ${idempotencyKey}`);

    // PASO 1: Validar timestamp (anti-replay attack)
    if (!validateTimestamp(timestamp)) {
      console.error('❌ Timestamp inválido o expirado');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired timestamp' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // PASO 2: Verificar firma HMAC
    const isValid = await verifySignature(body, signature, timestamp);
    if (!isValid) {
      console.error('❌ Firma HMAC inválida');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    console.log('✅ Firma HMAC verificada');

    // PASO 3: Conectar a Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // PASO 4: Verificar idempotencia
    const { data: existing } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (existing) {
      console.log('⚠️  IDEMPOTENCIA: Evento ya procesado');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Event already processed (idempotent)',
          event_id: existing.id,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // PASO 5: Guardar evento en base de datos (auditoría inmutable)
    const { data: savedEvent, error } = await supabase
      .from('webhook_events')
      .insert({
        event_id: webhookId,
        event_type: payload.event,
        idempotency_key: idempotencyKey,
        payload: payload,
        source: payload.metadata.source,
        correlation_id: payload.metadata.correlation_id,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error guardando evento:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save event', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    console.log(`✅ Evento guardado: ${savedEvent.id}`);
    console.log(`📊 Tipo: ${payload.event}`);
    console.log(`📦 Fuente: ${payload.metadata.source}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Event logged successfully',
        event_id: savedEvent.id,
        event_type: payload.event,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
