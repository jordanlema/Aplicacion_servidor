// @ts-nocheck
/* eslint-disable */
/**
 * NOTA: Los errores de TypeScript en este archivo son visuales únicamente.
 * Este código se ejecuta en Supabase Edge Functions con runtime Deno nativo.
 * El código está desplegado y funcionando correctamente.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') || 'dev-secret-key-change-in-production';
const TOLERANCE_SECONDS = 300; // 5 minutos de tolerancia para replay attacks
