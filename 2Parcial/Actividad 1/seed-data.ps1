# Script para crear datos iniciales de prueba

Write-Host "🌱 Creando datos iniciales..." -ForegroundColor Cyan

$GATEWAY_URL = "http://localhost:3000"

# Crear 3 cursos
$cursos = @(
    @{
        nombre = "Programación Web"
        descripcion = "Desarrollo web con NestJS y React"
        cupos_totales = 5
    },
    @{
        nombre = "Bases de Datos"
        descripcion = "PostgreSQL y diseño de bases de datos"
        cupos_totales = 3
    },
    @{
        nombre = "Arquitectura de Software"
        descripcion = "Patrones de diseño y microservicios"
        cupos_totales = 10
    }
)

foreach ($curso in $cursos) {
    $json = $curso | ConvertTo-Json
    Write-Host "📚 Creando curso: $($curso.nombre)..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$GATEWAY_URL/cursos" -Method POST -Body $json -ContentType "application/json"
        Write-Host "   ✅ Creado - Message ID: $($response.message_id)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Error: $_" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 1
}

Write-Host "`n✅ Datos iniciales creados" -ForegroundColor Green
Write-Host "💡 Revisa los logs de ms-curso para ver los IDs generados"
