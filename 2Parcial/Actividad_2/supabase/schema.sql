-- ============================================
-- ACTIVIDAD 2: SCHEMA DE SUPABASE
-- Sistema de Webhooks con Idempotencia
-- ============================================

-- Tabla 1: webhook_events
-- Propósito: Auditoría inmutable de todos los eventos recibidos
-- Función: Event Logger
CREATE TABLE IF NOT EXISTS webhook_events (
  id BIGSERIAL PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  idempotency_key VARCHAR(255) NOT NULL UNIQUE,
  payload JSONB NOT NULL,
  source VARCHAR(100) NOT NULL,
  correlation_id VARCHAR(255),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_idempotency_key ON webhook_events(idempotency_key);
CREATE INDEX idx_webhook_events_correlation_id ON webhook_events(correlation_id);
CREATE INDEX idx_webhook_events_processed_at ON webhook_events(processed_at DESC);

-- Comentarios para documentación
COMMENT ON TABLE webhook_events IS 'Auditoría inmutable de eventos de dominio publicados por los microservicios';
COMMENT ON COLUMN webhook_events.event_id IS 'ID único del evento generado por el microservicio';
COMMENT ON COLUMN webhook_events.event_type IS 'Tipo de evento: course.created, enrollment.created';
COMMENT ON COLUMN webhook_events.idempotency_key IS 'Clave de idempotencia para evitar procesamiento duplicado';
COMMENT ON COLUMN webhook_events.payload IS 'Payload completo del webhook en formato JSON';
COMMENT ON COLUMN webhook_events.source IS 'Microservicio que originó el evento';
COMMENT ON COLUMN webhook_events.correlation_id IS 'ID de correlación para trazabilidad';


-- Tabla 2: processed_notifications
-- Propósito: Registro de notificaciones enviadas con idempotencia
-- Función: Notifier
CREATE TABLE IF NOT EXISTS processed_notifications (
  id BIGSERIAL PRIMARY KEY,
  webhook_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  idempotency_key VARCHAR(255) NOT NULL UNIQUE,
  notification_sent BOOLEAN DEFAULT FALSE,
  payload_data JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_processed_notifications_idempotency_key ON processed_notifications(idempotency_key);
CREATE INDEX idx_processed_notifications_event_type ON processed_notifications(event_type);
CREATE INDEX idx_processed_notifications_webhook_id ON processed_notifications(webhook_id);

-- Comentarios para documentación
COMMENT ON TABLE processed_notifications IS 'Registro de notificaciones enviadas con control de idempotencia';
COMMENT ON COLUMN processed_notifications.webhook_id IS 'ID del webhook que disparó la notificación';
COMMENT ON COLUMN processed_notifications.event_type IS 'Tipo de evento que generó la notificación';
COMMENT ON COLUMN processed_notifications.idempotency_key IS 'Clave de idempotencia para evitar notificaciones duplicadas';
COMMENT ON COLUMN processed_notifications.notification_sent IS 'Indica si la notificación fue enviada exitosamente';


-- ============================================
-- TABLA 3: webhook_subscriptions
-- Gestión dinámica de URLs suscritas a eventos
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  secret VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  retry_config JSONB DEFAULT '{
    "max_attempts": 6,
    "backoff_type": "exponential",
    "initial_delay_ms": 60000,
    "delays": [60000, 300000, 1800000, 7200000, 43200000]
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_event_url UNIQUE(event_type, url)
);

CREATE INDEX idx_webhook_subscriptions_event_type ON webhook_subscriptions(event_type);
CREATE INDEX idx_webhook_subscriptions_is_active ON webhook_subscriptions(is_active);

COMMENT ON TABLE webhook_subscriptions IS 'Gestión de suscriptores de webhooks por tipo de evento';
COMMENT ON COLUMN webhook_subscriptions.event_type IS 'Tipo de evento al que está suscrito (course.created, enrollment.created)';
COMMENT ON COLUMN webhook_subscriptions.url IS 'URL del endpoint que recibirá el webhook';
COMMENT ON COLUMN webhook_subscriptions.secret IS 'Secret compartido para firma HMAC';
COMMENT ON COLUMN webhook_subscriptions.is_active IS 'Indica si la suscripción está activa';
COMMENT ON COLUMN webhook_subscriptions.retry_config IS 'Configuración de reintentos con exponential backoff';


-- ============================================
-- TABLA 4: webhook_deliveries
-- Auditoría completa de intentos de entrega
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id BIGSERIAL PRIMARY KEY,
  subscription_id BIGINT REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  event_id VARCHAR(255) NOT NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  status_code INTEGER,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'pending', 'retrying')),
  error_message TEXT,
  request_headers JSONB,
  response_body TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_ms INTEGER,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_attempt_number CHECK (attempt_number > 0 AND attempt_number <= 6)
);

CREATE INDEX idx_webhook_deliveries_event_id ON webhook_deliveries(event_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_subscription ON webhook_deliveries(subscription_id, status);
CREATE INDEX idx_webhook_deliveries_delivered_at ON webhook_deliveries(delivered_at DESC);
CREATE INDEX idx_webhook_deliveries_next_retry ON webhook_deliveries(next_retry_at) WHERE status = 'retrying';

COMMENT ON TABLE webhook_deliveries IS 'Auditoría completa de todos los intentos de entrega de webhooks';
COMMENT ON COLUMN webhook_deliveries.subscription_id IS 'Referencia a la suscripción que recibió el webhook';
COMMENT ON COLUMN webhook_deliveries.event_id IS 'ID del evento que se intentó entregar';
COMMENT ON COLUMN webhook_deliveries.attempt_number IS 'Número de intento (1-6)';
COMMENT ON COLUMN webhook_deliveries.status IS 'Estado de la entrega: success, failed, pending, retrying';
COMMENT ON COLUMN webhook_deliveries.duration_ms IS 'Duración de la petición HTTP en milisegundos';
COMMENT ON COLUMN webhook_deliveries.next_retry_at IS 'Timestamp del próximo intento (si aplica)';


-- ============================================
-- VISTAS DE OBSERVABILIDAD
-- ============================================

-- Vista: Eventos por tipo
CREATE OR REPLACE VIEW v_events_by_type AS
SELECT 
  event_type,
  COUNT(*) AS total_events,
  COUNT(DISTINCT source) AS sources,
  MIN(processed_at) AS first_event,
  MAX(processed_at) AS last_event
FROM webhook_events
GROUP BY event_type
ORDER BY total_events DESC;

-- Vista: Eventos recientes
CREATE OR REPLACE VIEW v_recent_events AS
SELECT 
  id,
  event_type,
  source,
  correlation_id,
  processed_at,
  payload->>'data' AS event_data
FROM webhook_events
ORDER BY processed_at DESC
LIMIT 100;

-- Vista: Estadísticas de notificaciones
CREATE OR REPLACE VIEW v_notification_stats AS
SELECT 
  event_type,
  COUNT(*) AS total_notifications,
  SUM(CASE WHEN notification_sent THEN 1 ELSE 0 END) AS sent_successfully,
  SUM(CASE WHEN NOT notification_sent THEN 1 ELSE 0 END) AS failed,
  ROUND(100.0 * SUM(CASE WHEN notification_sent THEN 1 ELSE 0 END) / COUNT(*), 2) AS success_rate
FROM processed_notifications
GROUP BY event_type;

-- Vista: Estadísticas de entregas por suscripción
CREATE OR REPLACE VIEW v_delivery_stats AS
SELECT 
  ws.id AS subscription_id,
  ws.event_type,
  ws.url,
  ws.is_active,
  COUNT(wd.id) AS total_deliveries,
  SUM(CASE WHEN wd.status = 'success' THEN 1 ELSE 0 END) AS successful,
  SUM(CASE WHEN wd.status = 'failed' THEN 1 ELSE 0 END) AS failed,
  SUM(CASE WHEN wd.status = 'retrying' THEN 1 ELSE 0 END) AS retrying,
  ROUND(100.0 * SUM(CASE WHEN wd.status = 'success' THEN 1 ELSE 0 END) / NULLIF(COUNT(wd.id), 0), 2) AS success_rate,
  MAX(wd.delivered_at) AS last_delivery,
  AVG(wd.duration_ms) AS avg_duration_ms
FROM webhook_subscriptions ws
LEFT JOIN webhook_deliveries wd ON ws.id = wd.subscription_id
GROUP BY ws.id, ws.event_type, ws.url, ws.is_active;

-- Vista: Entregas pendientes de retry
CREATE OR REPLACE VIEW v_pending_retries AS
SELECT 
  wd.id,
  wd.event_id,
  wd.attempt_number,
  wd.next_retry_at,
  ws.url,
  ws.event_type,
  wd.error_message,
  wd.delivered_at AS last_attempt
FROM webhook_deliveries wd
JOIN webhook_subscriptions ws ON wd.subscription_id = ws.id
WHERE wd.status = 'retrying'
  AND wd.next_retry_at <= NOW()
  AND wd.attempt_number < 6
ORDER BY wd.next_retry_at ASC;


-- ============================================
-- FUNCIONES DE UTILIDAD
-- ============================================

-- Función para limpiar eventos antiguos (más de 30 días)
CREATE OR REPLACE FUNCTION cleanup_old_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM webhook_events 
  WHERE processed_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comentario
COMMENT ON FUNCTION cleanup_old_events() IS 'Elimina eventos procesados hace más de 30 días para mantener limpia la base de datos';

-- Función para obtener el próximo tiempo de reintento con exponential backoff
CREATE OR REPLACE FUNCTION calculate_next_retry(
  attempt_number INTEGER,
  retry_config JSONB DEFAULT NULL
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  delay_ms INTEGER;
  delays INTEGER[];
BEGIN
  -- Configuración por defecto
  IF retry_config IS NULL THEN
    retry_config := '{
      "delays": [60000, 300000, 1800000, 7200000, 43200000]
    }'::jsonb;
  END IF;

  -- Obtener el array de delays
  delays := ARRAY(SELECT jsonb_array_elements_text(retry_config->'delays')::INTEGER);
  
  -- Si el intento supera el máximo, retornar NULL
  IF attempt_number > array_length(delays, 1) THEN
    RETURN NULL;
  END IF;
  
  -- Obtener el delay correspondiente
  delay_ms := delays[attempt_number];
  
  -- Calcular timestamp del próximo intento
  RETURN NOW() + (delay_ms || ' milliseconds')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_next_retry IS 'Calcula el próximo timestamp de reintento usando exponential backoff';


-- ============================================
-- DATOS DE INICIALIZACIÓN
-- ============================================

-- Insertar suscripciones por defecto para las Edge Functions
INSERT INTO webhook_subscriptions (event_type, url, secret, is_active) 
VALUES 
  (
    'course.created',
    'https://your-project.supabase.co/functions/v1/event-logger',
    'dev-secret-key-change-in-production',
    true
  ),
  (
    'enrollment.created',
    'https://your-project.supabase.co/functions/v1/event-logger',
    'dev-secret-key-change-in-production',
    true
  ),
  (
    'course.created',
    'https://your-project.supabase.co/functions/v1/notifier',
    'dev-secret-key-change-in-production',
    true
  ),
  (
    'enrollment.created',
    'https://your-project.supabase.co/functions/v1/notifier',
    'dev-secret-key-change-in-production',
    true
  )
ON CONFLICT (event_type, url) DO NOTHING;

COMMENT ON TABLE webhook_subscriptions IS '⚠️ IMPORTANTE: Actualizar URLs con tu proyecto real de Supabase';


-- ============================================
-- PERMISOS (opcional para producción)
-- ============================================

-- Crear rol para las Edge Functions si no existe
-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'edge_functions') THEN
--     CREATE ROLE edge_functions;
--   END IF;
-- END
-- $$;

-- Otorgar permisos
-- GRANT SELECT, INSERT ON webhook_events TO edge_functions;
-- GRANT SELECT, INSERT ON processed_notifications TO edge_functions;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO edge_functions;


-- ============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ============================================

-- Insertar evento de prueba
-- INSERT INTO webhook_events (
--   event_id, 
--   event_type, 
--   idempotency_key, 
--   payload, 
--   source, 
--   correlation_id
-- ) VALUES (
--   'evt_test_001',
--   'course.created',
--   'test-course-1-created',
--   '{"event":"course.created","version":"1.0","data":{"course_id":"1","name":"Test Course"}}'::jsonb,
--   'microservice-curso',
--   'req_test_001'
-- );

COMMENT ON SCHEMA public IS 'Schema principal para el sistema de webhooks de la Actividad 2';

-- Fin del script
