# 🚀 GUÍA DE CONFIGURACIÓN - SUPABASE

## Prerrequisitos

- Cuenta en [Supabase](https://supabase.com)
- Supabase CLI instalado: `npm install -g supabase`

## 📋 PASO 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Crea un nuevo proyecto
3. Guarda las credenciales:
   - **Project URL**: `https://tu-proyecto.supabase.co`
   - **Service Role Key**: (desde Project Settings > API)

## 📊 PASO 2: Crear Tablas

1. Ve a SQL Editor en tu proyecto
2. Copia y ejecuta el contenido de `schema.sql`
3. Verifica que se crearon las tablas:
   - `webhook_events`
   - `processed_notifications`

## ⚡ PASO 3: Desplegar Edge Functions

### Opción A: Usando Supabase CLI (Recomendado)

```bash
# Iniciar sesión
supabase login

# Enlazar con tu proyecto
supabase link --project-ref tu-proyecto-ref

# Desplegar funciones
supabase functions deploy event-logger
supabase functions deploy notifier

# Configurar secrets
supabase secrets set WEBHOOK_SECRET=dev-secret-key-change-in-production
```

### Opción B: Deploy Manual

1. Ve a Edge Functions en el dashboard
2. Crea nueva función: `event-logger`
3. Copia el contenido de `functions/event-logger/index.ts`
4. Repite para `notifier`

## 🔧 PASO 4: Configurar Variables de Entorno

En los microservicios, crea/actualiza `.env`:

```env
# Webhook Configuration
WEBHOOK_SECRET=dev-secret-key-change-in-production
EDGE_FUNCTION_EVENT_LOGGER_URL=https://tu-proyecto.supabase.co/functions/v1/event-logger
EDGE_FUNCTION_NOTIFIER_URL=https://tu-proyecto.supabase.co/functions/v1/notifier

# Supabase (opcional, para testing)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
```

## 🧪 PASO 5: Probar las Edge Functions

### Test con curl - Event Logger

```bash
curl -X POST https://tu-proyecto.supabase.co/functions/v1/event-logger \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: test-signature" \
  -H "x-webhook-timestamp: $(date +%s)" \
  -H "x-webhook-id: evt_test_001" \
  -H "x-idempotency-key: test-key-001" \
  -d '{
    "event": "course.created",
    "version": "1.0",
    "id": "evt_test_001",
    "idempotency_key": "test-key-001",
    "timestamp": "2025-12-16T10:00:00Z",
    "data": {
      "course_id": "1",
      "name": "Test Course"
    },
    "metadata": {
      "source": "test",
      "environment": "development",
      "correlation_id": "req_test_001"
    }
  }'
```

### Ver logs

```bash
supabase functions logs event-logger
supabase functions logs notifier
```

## 📊 PASO 6: Verificar Datos

En Supabase Dashboard > Table Editor:

1. Revisa `webhook_events` - debe tener el evento de prueba
2. Revisa `processed_notifications` - debe tener las notificaciones

## 🔐 Notas de Seguridad

- **IMPORTANTE**: Cambia `WEBHOOK_SECRET` en producción
- Usa valores diferentes para cada ambiente (dev/staging/prod)
- Mantén el Service Role Key seguro
- Habilita RLS (Row Level Security) si es necesario

## 🎯 URLs de las Edge Functions

Una vez desplegadas, tus URLs serán:

```
Event Logger: https://tu-proyecto.supabase.co/functions/v1/event-logger
Notifier:     https://tu-proyecto.supabase.co/functions/v1/notifier
```

Usa estas URLs en las variables de entorno de los microservicios.

## 📖 Recursos

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
