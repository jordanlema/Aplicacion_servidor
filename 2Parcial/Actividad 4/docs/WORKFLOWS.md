# 🔄 Workflows - Explicación Detallada

Esta guía explica en profundidad cada uno de los 3 workflows implementados, su funcionamiento interno y cómo personalizarlos.

## 📦 Importar Workflows

### Método 1: Desde la Interfaz

1. Accede a n8n: http://localhost:5678
2. Inicia sesión (admin/admin123)
3. Click en **Workflows** (menú lateral)
4. Click en **Import from File**
5. Selecciona el archivo JSON del workflow
6. Click en **Import**
7. El workflow se abrirá automáticamente
8. Click en **Activate** (toggle en la esquina superior derecha)

### Método 2: Desde la Carpeta de Importación

Los workflows en `workflows/` se pueden copiar automáticamente:

```powershell
# Docker montó la carpeta workflows/ como volumen
# n8n puede importarlos desde la interfaz buscando en la carpeta mounted
```

### Verificar Importación

- [ ] Los 3 workflows aparecen en la lista
- [ ] Cada workflow está **Activo** (toggle verde)
- [ ] No hay errores de credenciales (iconos rojos)

---

## 🟦 Workflow 1: Notificación en Tiempo Real

**Archivo:** `01-notificacion-tiempo-real.json`

### 📋 Resumen

Este workflow escucha eventos de nuevas inscripciones, valida los datos, genera un mensaje personalizado con Gemini IA y lo envía por Telegram.

### 🔄 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Webhook         IF          Set        Gemini      Telegram   │
│  Inscripción  → Validar → Transformar → Generar → Notificar → │
│  Creada         Datos       Datos       Mensaje                │
│                   ↓                                             │
│                 Error                                           │
│                   ↓                                             │
│              Respond 400                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 🔍 Análisis Nodo por Nodo

#### 1. Webhook - Inscripción Creada

**Tipo:** Trigger Node (Nodo disparador)

**Configuración:**
```json
{
  "httpMethod": "POST",
  "path": "inscripcion.creada",
  "responseMode": "responseNode"
}
```

**URL del Webhook:**
```
http://localhost:5678/webhook/inscripcion.creada
```

**Payload Esperado:**
```json
{
  "tipo": "inscripcion.creada",
  "timestamp": "2026-01-13T10:00:00Z",
  "datos": {
    "inscripcion_id": "123",
    "curso_id": "456",
    "curso_nombre": "Programación Web",
    "estudiante_nombre": "Juan Pérez",
    "estudiante_email": "juan@ejemplo.com",
    "fecha_inscripcion": "2026-01-13T10:00:00Z"
  },
  "metadata": {
    "origen": "ms-inscripcion",
    "version": "1.0"
  }
}
```

**Función:** Recibe el evento HTTP POST del backend.

---

#### 2. IF - Validar Datos

**Tipo:** Logic Node

**Condiciones:**
1. `$json.tipo` debe ser igual a `"inscripcion.creada"`
2. `$json.datos.estudiante_nombre` no debe estar vacío

**Salidas:**
- **True:** Los datos son válidos → continúa al siguiente nodo
- **False:** Datos inválidos → responde con error 400

**Expresión n8n:**
```javascript
={{ $json.tipo === 'inscripcion.creada' && $json.datos.estudiante_nombre }}
```

**Función:** Validación de seguridad antes de procesar.

---

#### 3. Set - Transformar Datos

**Tipo:** Data Transformation Node

**Transformación:**
```javascript
{
  "estudiante": "={{ $json.datos.estudiante_nombre }}",
  "curso": "={{ $json.datos.curso_nombre }}",
  "fecha": "={{ $json.datos.fecha_inscripcion }}",
  "evento": "inscripcion_exitosa"
}
```

**Salida:**
```json
{
  "estudiante": "Juan Pérez",
  "curso": "Programación Web",
  "fecha": "2026-01-13T10:00:00Z",
  "evento": "inscripcion_exitosa"
}
```

**Función:** Simplifica el objeto para los nodos siguientes.

---

#### 4. Gemini - Generar Mensaje

**Tipo:** AI Node

**Prompt:**
```
Genera un mensaje de notificación corto y amigable para confirmar que 
{{ $json.estudiante }} se ha inscrito exitosamente en el curso 
{{ $json.curso }}. El mensaje debe ser entusiasta y motivador, 
en máximo 2 líneas.
```

**Configuración:**
- **Modelo:** `gemini-1.5-flash`
- **Temperature:** 0.7 (creatividad moderada)
- **Max Tokens:** 100

**Ejemplo de Salida:**
```
¡Excelente noticia! 🎉 Juan Pérez acaba de comenzar su viaje en 
Programación Web. ¡Éxitos en este nuevo desafío!
```

**Función:** Genera mensajes personalizados y motivadores con IA.

---

#### 5. Telegram - Enviar Notificación

**Tipo:** Communication Node

**Mensaje (Markdown):**
```markdown
🎓 *NUEVA INSCRIPCIÓN*

{{ $json.message }}

📚 *Curso:* {{ $('Set - Transformar Datos').item.json.curso }}
👤 *Estudiante:* {{ $('Set - Transformar Datos').item.json.estudiante }}
📅 *Fecha:* {{ new Date($('Set - Transformar Datos').item.json.fecha).toLocaleString('es-ES') }}

✅ *Estado:* Confirmada
```

**Configuración:**
- **Chat ID:** `$env.TELEGRAM_CHAT_ID`
- **Parse Mode:** Markdown

**Función:** Envía notificación formateada a Telegram.

---

#### 6. Respond to Webhook

**Tipo:** Response Node

**Respuesta Success (200):**
```json
{
  "success": true,
  "message": "Notificación enviada correctamente",
  "timestamp": "2026-01-13T10:05:23Z"
}
```

**Respuesta Error (400):**
```json
{
  "success": false,
  "message": "Datos inválidos",
  "timestamp": "2026-01-13T10:05:23Z"
}
```

**Función:** Confirma al backend que el webhook fue procesado.

---

### 🧪 Probar el Workflow

```powershell
curl -X POST http://localhost:5678/webhook/inscripcion.creada `
  -H "Content-Type: application/json" `
  -d '{
    "tipo": "inscripcion.creada",
    "timestamp": "2026-01-13T15:30:00Z",
    "datos": {
      "inscripcion_id": "INS-001",
      "curso_id": "CUR-101",
      "curso_nombre": "Introducción a Node.js",
      "estudiante_nombre": "María García",
      "estudiante_email": "maria@ejemplo.com",
      "fecha_inscripcion": "2026-01-13T15:30:00Z"
    },
    "metadata": {
      "origen": "ms-inscripcion",
      "version": "1.0"
    }
  }'
```

**Resultado Esperado:**
1. ✅ Respuesta HTTP 200
2. 📱 Mensaje en Telegram
3. 📊 Registro en ejecuciones de n8n

---

## 🟦 Workflow 2: Sincronización con Google Sheets

**Archivo:** `02-sincronizacion-sheets.json`

### 📋 Resumen

Este workflow registra todos los eventos importantes en una hoja de cálculo de Google Sheets para análisis y auditoría.

### 🔄 Diagrama de Flujo

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  Webhook     Set          Google        Respond │
│  Recibir → Transformar → Sheets     → Success   │
│  Eventos    para Sheets   Append                │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 🔍 Análisis Nodo por Nodo

#### 1. Webhook - Recibir Eventos

**URL:** `http://localhost:5678/webhook/eventos`

**Acepta cualquier tipo de evento:**
- `inscripcion.creada`
- `inscripcion.cancelada`
- `curso.cupos_agotados`
- Eventos personalizados

---

#### 2. Set - Transformar para Sheets

**Transformación:**
```javascript
{
  "fecha": "={{ new Date($json.timestamp).toLocaleString('es-ES') }}",
  "tipo_evento": "={{ $json.tipo }}",
  "curso": "={{ $json.datos.curso_nombre }}",
  "estudiante": "={{ $json.datos.estudiante_nombre || 'N/A' }}",
  "estado": "={{ $json.tipo === 'inscripcion.creada' ? 'Activa' : $json.tipo === 'inscripcion.cancelada' ? 'Cancelada' : 'Procesando' }}",
  "curso_id": "={{ $json.datos.curso_id }}",
  "inscripcion_id": "={{ $json.datos.inscripcion_id || 'N/A' }}",
  "email": "={{ $json.datos.estudiante_email || 'N/A' }}",
  "criticidad": "={{ $json.criticidad || 'normal' }}",
  "origen": "={{ $json.metadata.origen }}"
}
```

**Lógica Condicional:**
- Si estudiante no existe → "N/A"
- Si inscripcion_id no existe → "N/A"
- Estado según tipo de evento

---

#### 3. Google Sheets - Registrar Evento

**Operación:** Append Row (Agregar fila)

**Documento:** Variable de entorno `GOOGLE_SHEETS_ID`

**Hoja:** "Eventos"

**Mapeo de Columnas:**
| Columna Sheet | Valor n8n |
|---------------|-----------|
| Fecha | `$json.fecha` |
| Tipo de Evento | `$json.tipo_evento` |
| Curso | `$json.curso` |
| Estudiante | `$json.estudiante` |
| Estado | `$json.estado` |
| Curso ID | `$json.curso_id` |
| Inscripción ID | `$json.inscripcion_id` |
| Email | `$json.email` |
| Criticidad | `$json.criticidad` |
| Origen | `$json.origen` |

---

#### 4. Respond to Webhook - Registrado

**Respuesta:**
```json
{
  "success": true,
  "message": "Evento registrado en Google Sheets",
  "tipo_evento": "inscripcion.creada",
  "timestamp": "2026-01-13T10:05:23Z"
}
```

---

### 📊 Estructura de Google Sheet

**Nombre de la hoja:** "Registro de Eventos - n8n"

**Pestaña:** "Eventos"

**Encabezados (Fila 1):**

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Fecha | Tipo de Evento | Curso | Estudiante | Estado | Curso ID | Inscripción ID | Email | Criticidad | Origen |

**Ejemplo de Datos:**

| Fecha | Tipo de Evento | Curso | Estudiante | Estado | Curso ID | Inscripción ID | Email | Criticidad | Origen |
|-------|---------------|-------|------------|--------|----------|---------------|-------|-----------|--------|
| 13/01/2026 15:30 | inscripcion.creada | Node.js | María García | Activa | CUR-101 | INS-001 | maria@ejemplo.com | normal | ms-inscripcion |
| 13/01/2026 16:45 | curso.cupos_agotados | Python | N/A | Procesando | CUR-102 | N/A | N/A | alta | ms-curso |

---

### 🧪 Probar el Workflow

```powershell
curl -X POST http://localhost:5678/webhook/eventos `
  -H "Content-Type: application/json" `
  -d '{
    "tipo": "inscripcion.cancelada",
    "timestamp": "2026-01-13T16:00:00Z",
    "datos": {
      "inscripcion_id": "INS-002",
      "curso_id": "CUR-103",
      "curso_nombre": "React Avanzado",
      "estudiante_nombre": "Carlos López",
      "estudiante_email": "carlos@ejemplo.com"
    },
    "metadata": {
      "origen": "ms-inscripcion",
      "version": "1.0"
    }
  }'
```

**Verificar:**
1. ✅ Respuesta HTTP 200
2. 📊 Nueva fila en Google Sheets
3. 📈 Datos correctamente formateados

---

## 🟦 Workflow 3: Alertas de Condiciones Críticas

**Archivo:** `03-alerta-critica.json`

### 📋 Resumen

Este workflow evalúa eventos críticos usando IA (Gemini), clasifica la urgencia y ejecuta acciones específicas según el nivel.

### 🔄 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Webhook    IF        Gemini      Switch                    │
│  Recibir → ¿Crítico? → Analizar → Nivel    ┌─→ Telegram    │
│  Eventos      │        Urgencia   │         ├─→ Email       │
│               ↓                    └─────────└─→ Log        │
│          Respond                                            │
│          No Crítico                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🔍 Análisis Nodo por Nodo

#### 1. Webhook - Recibir Eventos

**URL:** `http://localhost:5678/webhook/alertas`

**Eventos Esperados:**
- `curso.cupos_agotados` (prioridad alta)
- Eventos con `metadata.requiere_accion = true`

---

#### 2. IF - ¿Es Crítico?

**Condiciones:**
```javascript
$json.tipo === 'curso.cupos_agotados' 
&& 
$json.metadata.requiere_accion === true
```

**Salidas:**
- **True:** Evento crítico → Continúa a Gemini
- **False:** No crítico → Responde directamente

---

#### 3. Gemini - Analizar Urgencia

**Prompt Completo:**
```
Analiza la siguiente situación crítica:

Tipo de evento: {{ $json.tipo }}
Curso: {{ $json.datos.curso_nombre }}
Cupos máximos: {{ $json.datos.cupos_maximos }}
Inscritos actuales: {{ $json.datos.inscritos_actuales }}

Evalúa la urgencia de esta situación y responde únicamente con una palabra: ALTA, MEDIA o BAJA.

Criterios:
- ALTA: Requiere acción inmediata (cupos completamente agotados)
- MEDIA: Requiere atención pronta (más del 80% ocupado)
- BAJA: Para monitoreo (menos del 80% ocupado)

Respuesta (una palabra):
```

**Configuración:**
- **Modelo:** `gemini-1.5-flash`
- **Temperature:** 0.3 (más determinista)
- **Max Tokens:** 10 (solo una palabra)

**Salidas Posibles:**
- "ALTA"
- "MEDIA"
- "BAJA"

---

#### 4. Switch - Nivel de Urgencia

**Evaluación:**
```javascript
$json.message.trim().toUpperCase()
```

**Rutas:**
- **Ruta 0:** Contiene "ALTA" → Telegram
- **Ruta 1:** Contiene "MEDIA" → Email
- **Ruta 2:** Contiene "BAJA" → Log

---

#### 5a. Telegram - Alerta ALTA 🔴

**Mensaje:**
```markdown
🚨 *ALERTA CRÍTICA - PRIORIDAD ALTA* 🚨

*Curso:* Programación Web
*Situación:* Cupos completamente agotados

📊 *Detalles:*
• Cupos máximos: 30
• Inscritos actuales: 30
• Ocupación: 100%

⚠️ *Acción requerida:*
Revisar lista de espera o considerar abrir nuevo grupo.

🕐 13/01/2026 16:30:45
```

---

#### 5b. Email - Alerta MEDIA 🟡

**Asunto:**
```
⚠️ Alerta Media: Programación Web
```

**Cuerpo (HTML):**
```html
<html>
<body style="font-family: Arial, sans-serif;">
  <h2 style="color: #ff9800;">⚠️ Alerta de Nivel MEDIO</h2>
  
  <p><strong>Curso:</strong> Programación Web</p>
  
  <h3>Detalles de Ocupación:</h3>
  <ul>
    <li><strong>Cupos máximos:</strong> 30</li>
    <li><strong>Inscritos actuales:</strong> 25</li>
    <li><strong>Ocupación:</strong> 83%</li>
  </ul>
  
  <p style="background-color: #fff3e0; padding: 10px; border-left: 4px solid #ff9800;">
    <strong>Recomendación:</strong> Monitorear inscripciones próximas. 
    El curso está cerca de completarse.
  </p>
  
  <p style="color: #666; font-size: 12px;">
    Generado automáticamente el 13/01/2026 16:30:45
  </p>
</body>
</html>
```

---

#### 5c. File - Log Alerta BAJA 🟢

**Archivo:** `alertas-bajas.log`

**Formato:**
```
[2026-01-13T16:30:45.123Z] BAJA - Curso: Programación Web - Ocupación: 60%
```

**Ubicación:** `/home/node/.n8n/logs/alertas-bajas.log`

---

### 🧪 Probar el Workflow

#### Test 1: Alerta ALTA

```powershell
curl -X POST http://localhost:5678/webhook/alertas `
  -H "Content-Type: application/json" `
  -d '{
    "tipo": "curso.cupos_agotados",
    "criticidad": "alta",
    "timestamp": "2026-01-13T16:30:00Z",
    "datos": {
      "curso_id": "CUR-101",
      "curso_nombre": "Programación Web",
      "cupos_maximos": 30,
      "inscritos_actuales": 30
    },
    "metadata": {
      "origen": "ms-curso",
      "requiere_accion": true
    }
  }'
```

**Esperado:**
- 📱 Notificación inmediata en Telegram
- 📊 Registro con criticidad "alta"

#### Test 2: Alerta MEDIA

Cambia `inscritos_actuales` a 25 (83% ocupación)

**Esperado:**
- 📧 Email al administrador
- 📊 Registro con criticidad "media"

#### Test 3: Alerta BAJA

Cambia `inscritos_actuales` a 18 (60% ocupación)

**Esperado:**
- 📄 Entrada en archivo de log
- 📊 Registro con criticidad "baja"

---

## 🛠️ Personalización

### Cambiar Umbrales de Alerta

Edita el prompt de Gemini en el nodo "Gemini - Analizar Urgencia":

```
Criterios:
- ALTA: 100% ocupado
- MEDIA: 80-99% ocupado
- BAJA: menos de 80%
```

### Agregar Más Acciones

Agrega nodos después del Switch:
- **Slack:** Notificaciones en equipos
- **Discord:** Alertas en comunidades
- **Database:** Guardar en base de datos
- **HTTP Request:** Llamar a otro webhook

### Modificar Mensajes

Edita los nodos de Telegram/Email para personalizar:
- Formato del mensaje
- Emojis
- Información adicional
- Llamadas a la acción

---

## 📈 Monitoreo y Depuración

### Ver Ejecuciones

1. En n8n, ve a **Executions**
2. Filtra por workflow
3. Click en una ejecución para ver:
   - Datos de entrada
   - Datos de cada nodo
   - Errores (si los hay)
   - Tiempo de ejecución

### Habilitar Debug Mode

```yaml
# En docker-compose.yml
environment:
  - N8N_LOG_LEVEL=debug
```

### Logs en Tiempo Real

```powershell
docker-compose logs -f n8n
```

---

## 🎯 Checklist de Validación

### Workflow 1
- [ ] Webhook responde correctamente
- [ ] IF valida datos
- [ ] Gemini genera mensajes únicos
- [ ] Telegram recibe notificaciones
- [ ] Respond devuelve JSON correcto

### Workflow 2
- [ ] Webhook acepta múltiples tipos de eventos
- [ ] Set transforma correctamente
- [ ] Google Sheets agrega filas
- [ ] Formato de fecha es correcto
- [ ] Maneja campos opcionales (N/A)

### Workflow 3
- [ ] IF detecta eventos críticos
- [ ] Gemini clasifica urgencia
- [ ] Switch rutea correctamente
- [ ] Telegram: ALTA funciona
- [ ] Email: MEDIA funciona
- [ ] Log: BAJA funciona

---

## 🔗 Próximos Pasos

1. [Configurar Integraciones](INTEGRACIONES.md)
2. Implementar en producción
3. Crear workflows adicionales
4. Optimizar rendimiento
