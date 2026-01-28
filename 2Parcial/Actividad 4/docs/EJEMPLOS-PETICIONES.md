# Ejemplos de Peticiones - n8n Workflows

Este archivo contiene ejemplos de peticiones HTTP para probar cada workflow.

## 📋 Variables de Entorno

```powershell
$n8nUrl = "http://localhost:5678"
$headers = @{ "Content-Type" = "application/json" }
```

---

## 🟦 Workflow 1: Notificación en Tiempo Real

### ✅ Caso de Éxito - Inscripción Creada

```powershell
$body = @{
    tipo = "inscripcion.creada"
    timestamp = (Get-Date -Format o)
    datos = @{
        inscripcion_id = "INS-001"
        curso_id = "CUR-101"
        curso_nombre = "Programación Web con Node.js"
        estudiante_nombre = "María García"
        estudiante_email = "maria.garcia@ejemplo.com"
        fecha_inscripcion = (Get-Date -Format o)
    }
    metadata = @{
        origen = "ms-inscripcion"
        version = "1.0"
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "$n8nUrl/webhook/inscripcion.creada" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Notificación enviada correctamente",
  "timestamp": "2026-01-13T10:05:23.456Z"
}
```

### ❌ Caso de Error - Datos Incompletos

```powershell
$body = @{
    tipo = "inscripcion.creada"
    timestamp = (Get-Date -Format o)
    datos = @{
        curso_nombre = "Node.js"
        # Falta estudiante_nombre
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "$n8nUrl/webhook/inscripcion.creada" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**Respuesta Esperada:**
```json
{
  "success": false,
  "message": "Datos inválidos",
  "timestamp": "2026-01-13T10:05:23.456Z"
}
```

---

## 🟦 Workflow 2: Sincronización con Google Sheets

### Evento: Inscripción Creada

```powershell
$body = @{
    tipo = "inscripcion.creada"
    timestamp = (Get-Date -Format o)
    datos = @{
        inscripcion_id = "INS-002"
        curso_id = "CUR-102"
        curso_nombre = "Python para Data Science"
        estudiante_nombre = "Carlos López"
        estudiante_email = "carlos.lopez@ejemplo.com"
        fecha_inscripcion = (Get-Date -Format o)
    }
    metadata = @{
        origen = "ms-inscripcion"
        version = "1.0"
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "$n8nUrl/webhook/eventos" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### Evento: Inscripción Cancelada

```powershell
$body = @{
    tipo = "inscripcion.cancelada"
    timestamp = (Get-Date -Format o)
    datos = @{
        inscripcion_id = "INS-003"
        curso_id = "CUR-103"
        curso_nombre = "React Avanzado"
        estudiante_nombre = "Ana Martínez"
        estudiante_email = "ana.martinez@ejemplo.com"
        motivo = "Conflicto de horarios"
    }
    metadata = @{
        origen = "ms-inscripcion"
        version = "1.0"
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "$n8nUrl/webhook/eventos" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### Evento: Cupos Agotados

```powershell
$body = @{
    tipo = "curso.cupos_agotados"
    timestamp = (Get-Date -Format o)
    datos = @{
        curso_id = "CUR-104"
        curso_nombre = "Docker y Kubernetes"
        cupos_maximos = 25
        inscritos_actuales = 25
    }
    metadata = @{
        origen = "ms-curso"
        version = "1.0"
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "$n8nUrl/webhook/eventos" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Evento registrado en Google Sheets",
  "tipo_evento": "inscripcion.creada",
  "timestamp": "2026-01-13T10:05:23.456Z"
}
```

---

## 🟦 Workflow 3: Alertas de Condiciones Críticas

### 🔴 Alerta ALTA - Cupos 100% Agotados

```powershell
$body = @{
    tipo = "curso.cupos_agotados"
    criticidad = "alta"
    timestamp = (Get-Date -Format o)
    datos = @{
        curso_id = "CUR-105"
        curso_nombre = "DevOps con AWS"
        cupos_maximos = 30
        inscritos_actuales = 30
    }
    metadata = @{
        origen = "ms-curso"
        version = "1.0"
        requiere_accion = $true
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "$n8nUrl/webhook/alertas" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**Resultado Esperado:**
- 📱 Notificación en Telegram
- 📊 Registro en Google Sheets
- ✅ Respuesta con `nivel_urgencia: "alta"`

### 🟡 Alerta MEDIA - 80% Ocupación

```powershell
$body = @{
    tipo = "curso.cupos_agotados"
    criticidad = "media"
    timestamp = (Get-Date -Format o)
    datos = @{
        curso_id = "CUR-106"
        curso_nombre = "Microservicios con NestJS"
        cupos_maximos = 25
        inscritos_actuales = 21
    }
    metadata = @{
        origen = "ms-curso"
        version = "1.0"
        requiere_accion = $true
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "$n8nUrl/webhook/alertas" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**Resultado Esperado:**
- 📧 Email al administrador
- 📊 Registro en Google Sheets
- ✅ Respuesta con `nivel_urgencia: "media"`

### 🟢 Alerta BAJA - 60% Ocupación

```powershell
$body = @{
    tipo = "curso.cupos_agotados"
    criticidad = "baja"
    timestamp = (Get-Date -Format o)
    datos = @{
        curso_id = "CUR-107"
        curso_nombre = "Git y GitHub"
        cupos_maximos = 20
        inscritos_actuales = 12
    }
    metadata = @{
        origen = "ms-curso"
        version = "1.0"
        requiere_accion = $true
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "$n8nUrl/webhook/alertas" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**Resultado Esperado:**
- 📄 Entrada en archivo de log
- 📊 Registro en Google Sheets
- ✅ Respuesta con `nivel_urgencia: "baja"`

### ⚪ No Crítico - Sin requiere_accion

```powershell
$body = @{
    tipo = "curso.actualizado"
    timestamp = (Get-Date -Format o)
    datos = @{
        curso_id = "CUR-108"
        curso_nombre = "TypeScript Básico"
        cambios = "Actualización de contenido"
    }
    metadata = @{
        origen = "ms-curso"
        version = "1.0"
        requiere_accion = $false
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "$n8nUrl/webhook/alertas" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**Resultado Esperado:**
```json
{
  "success": false,
  "message": "Evento no crítico",
  "timestamp": "2026-01-13T10:05:23.456Z"
}
```

---

## 🧪 Script de Prueba Completo

### Archivo: `test-workflows.ps1`

```powershell
# Configuración
$n8nUrl = "http://localhost:5678"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "🧪 Iniciando pruebas de workflows n8n..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Notificación en Tiempo Real
Write-Host "📱 Test 1: Notificación en Tiempo Real" -ForegroundColor Yellow

$body1 = @{
    tipo = "inscripcion.creada"
    timestamp = (Get-Date -Format o)
    datos = @{
        inscripcion_id = "TEST-001"
        curso_id = "TEST-CUR-001"
        curso_nombre = "Curso de Prueba"
        estudiante_nombre = "Estudiante Test"
        estudiante_email = "test@ejemplo.com"
        fecha_inscripcion = (Get-Date -Format o)
    }
    metadata = @{
        origen = "test-script"
        version = "1.0"
    }
} | ConvertTo-Json -Depth 5

try {
    $response1 = Invoke-RestMethod -Uri "$n8nUrl/webhook/inscripcion.creada" `
        -Method POST `
        -Headers $headers `
        -Body $body1
    
    Write-Host "✅ Test 1 exitoso: $($response1.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Test 1 falló: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Start-Sleep -Seconds 2

# Test 2: Sincronización Google Sheets
Write-Host "📊 Test 2: Sincronización con Google Sheets" -ForegroundColor Yellow

$body2 = @{
    tipo = "inscripcion.creada"
    timestamp = (Get-Date -Format o)
    datos = @{
        inscripcion_id = "TEST-002"
        curso_id = "TEST-CUR-002"
        curso_nombre = "Otro Curso de Prueba"
        estudiante_nombre = "Otro Estudiante"
        estudiante_email = "otro@ejemplo.com"
        fecha_inscripcion = (Get-Date -Format o)
    }
    metadata = @{
        origen = "test-script"
        version = "1.0"
    }
} | ConvertTo-Json -Depth 5

try {
    $response2 = Invoke-RestMethod -Uri "$n8nUrl/webhook/eventos" `
        -Method POST `
        -Headers $headers `
        -Body $body2
    
    Write-Host "✅ Test 2 exitoso: $($response2.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Test 2 falló: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Start-Sleep -Seconds 2

# Test 3: Alerta Crítica ALTA
Write-Host "🚨 Test 3: Alerta Crítica ALTA" -ForegroundColor Yellow

$body3 = @{
    tipo = "curso.cupos_agotados"
    criticidad = "alta"
    timestamp = (Get-Date -Format o)
    datos = @{
        curso_id = "TEST-CUR-003"
        curso_nombre = "Curso Lleno Test"
        cupos_maximos = 30
        inscritos_actuales = 30
    }
    metadata = @{
        origen = "test-script"
        version = "1.0"
        requiere_accion = $true
    }
} | ConvertTo-Json -Depth 5

try {
    $response3 = Invoke-RestMethod -Uri "$n8nUrl/webhook/alertas" `
        -Method POST `
        -Headers $headers `
        -Body $body3
    
    Write-Host "✅ Test 3 exitoso: Nivel $($response3.nivel_urgencia)" -ForegroundColor Green
} catch {
    Write-Host "❌ Test 3 falló: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Pruebas completadas!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verifica:" -ForegroundColor Yellow
Write-Host "  📱 Telegram: Deberías tener 2 notificaciones"
Write-Host "  📊 Google Sheets: Deberías tener 3 nuevas filas"
Write-Host "  📈 n8n: Ve a Executions para ver detalles"
```

### Ejecutar Script

```powershell
# Dar permisos de ejecución
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Ejecutar
.\test-workflows.ps1
```

---

## 📊 Verificación de Resultados

### En Telegram

Deberías ver mensajes como:

```
🎓 NUEVA INSCRIPCIÓN

¡Excelente noticia! 🎉 Estudiante Test acaba de comenzar 
su viaje en Curso de Prueba. ¡Éxitos en este nuevo desafío!

📚 Curso: Curso de Prueba
👤 Estudiante: Estudiante Test
📅 Fecha: 13/01/2026 15:30:45

✅ Estado: Confirmada
```

### En Google Sheets

| Fecha | Tipo de Evento | Curso | Estudiante | Estado |
|-------|---------------|-------|------------|--------|
| 13/01/2026 15:30 | inscripcion.creada | Curso de Prueba | Estudiante Test | Activa |

### En n8n

1. Ve a **Executions** (menú lateral)
2. Deberías ver 3 ejecuciones recientes
3. Status: **Success** (verde)
4. Duración: ~1-3 segundos

---

## 🔧 Troubleshooting

### Error: "Connection refused"

**Causa:** n8n no está corriendo

**Solución:**
```powershell
cd "Actividad 4/n8n"
docker-compose up -d
```

### Error: "Webhook not found"

**Causa:** Workflow no está activo o no fue importado

**Solución:**
1. Ve a n8n: http://localhost:5678
2. Verifica que el workflow esté **Activo** (toggle verde)
3. Verifica que la URL del webhook sea correcta

### Error: "Telegram API error"

**Causa:** Credenciales de Telegram incorrectas

**Solución:**
1. Ve a n8n → Settings → Credentials
2. Edita "Telegram API"
3. Verifica Token y prueba la conexión

---

## 📝 Notas

- Todos los ejemplos usan PowerShell
- Para Bash/Linux, usa `curl` en lugar de `Invoke-RestMethod`
- Los timestamps se generan dinámicamente con `Get-Date`
- Ajusta URLs si usas puertos diferentes
