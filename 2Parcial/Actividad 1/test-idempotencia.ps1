# Script de Prueba - Demostración de Idempotencia
# Este script demuestra cómo el sistema maneja mensajes duplicados

Write-Host "🧪 PRUEBA DE IDEMPOTENCIA - Patrón Idempotent Consumer" -ForegroundColor Cyan
Write-Host "=" * 70

$GATEWAY_URL = "http://localhost:3000"

# Paso 1: Crear un curso de prueba
Write-Host "`n📚 PASO 1: Creando curso de prueba..." -ForegroundColor Yellow
$curso = @{
    nombre = "Programación Web"
    descripcion = "Curso de desarrollo web con NestJS y React"
    cupos_totales = 5
} | ConvertTo-Json

$cursoResponse = Invoke-RestMethod -Uri "$GATEWAY_URL/cursos" -Method POST -Body $curso -ContentType "application/json"
$cursoId = "será obtenido del log de ms-curso"

Write-Host "✅ Curso creado" -ForegroundColor Green
Write-Host "   Message ID: $($cursoResponse.message_id)"

Start-Sleep -Seconds 2

# Paso 2: Primera inscripción (DEBE FUNCIONAR)
Write-Host "`n📝 PASO 2: Primera inscripción (mensaje original)..." -ForegroundColor Yellow

$idempotencyKey = [guid]::NewGuid().ToString()
Write-Host "   Idempotency Key generado: $idempotencyKey" -ForegroundColor Magenta

$inscripcion = @{
    curso_id = "REEMPLAZAR_CON_ID_REAL"
    estudiante_nombre = "Juan Pérez"
    estudiante_email = "juan.perez@ejemplo.com"
    idempotency_key = $idempotencyKey
} | ConvertTo-Json

Write-Host "   Enviando inscripción..."
$response1 = Invoke-RestMethod -Uri "$GATEWAY_URL/inscripciones" -Method POST -Body $inscripcion -ContentType "application/json"

Write-Host "✅ Respuesta 1:" -ForegroundColor Green
Write-Host "   Éxito: $($response1.success)"
Write-Host "   Es nuevo: $($response1.isNew)"
Write-Host "   Mensaje: $($response1.message)"
Write-Host "   ID Inscripción: $($response1.inscripcion.id)"

Start-Sleep -Seconds 2

# Paso 3: DUPLICAR el mensaje (DEBE SER IGNORADO)
Write-Host "`n🔄 PASO 3: Duplicando el mismo mensaje (idempotencia)..." -ForegroundColor Yellow
Write-Host "   Usando el MISMO Idempotency Key: $idempotencyKey" -ForegroundColor Magenta

Write-Host "   Enviando mensaje duplicado..."
$response2 = Invoke-RestMethod -Uri "$GATEWAY_URL/inscripciones" -Method POST -Body $inscripcion -ContentType "application/json"

Write-Host "✅ Respuesta 2 (Mensaje Duplicado):" -ForegroundColor Green
Write-Host "   Éxito: $($response2.success)"
Write-Host "   Es nuevo: $($response2.isNew)" -ForegroundColor Red
Write-Host "   Mensaje: $($response2.message)" -ForegroundColor Cyan
Write-Host "   ID Inscripción: $($response2.inscripcion.id)"

# Verificación
Write-Host "`n🎯 VERIFICACIÓN DE IDEMPOTENCIA:" -ForegroundColor Cyan
if ($response1.inscripcion.id -eq $response2.inscripcion.id -and $response2.isNew -eq $false) {
    Write-Host "✅ ¡ÉXITO! La idempotencia funcionó correctamente" -ForegroundColor Green
    Write-Host "   - Mismo ID de inscripción: $($response1.inscripcion.id)"
    Write-Host "   - Segunda llamada detectó duplicado (isNew = false)"
    Write-Host "   - El cupo NO se reservó dos veces en el curso"
} else {
    Write-Host "❌ ERROR: La idempotencia NO funcionó" -ForegroundColor Red
}

Write-Host "`n📊 Revisa los logs de ms-curso para ver:" -ForegroundColor Yellow
Write-Host "   1. Mensaje 'reserveSpot' procesado la primera vez"
Write-Host "   2. Mensaje duplicado IGNORADO con mensaje de Redis"

Write-Host "`n✅ Prueba completada" -ForegroundColor Green
