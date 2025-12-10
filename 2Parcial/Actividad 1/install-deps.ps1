# Script de instalación de dependencias

Write-Host "📦 Instalando dependencias de todos los microservicios..." -ForegroundColor Cyan
Write-Host ""

# ms-curso
Write-Host "📚 Instalando dependencias de ms-curso..." -ForegroundColor Yellow
Set-Location -Path "ms-curso"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ms-curso: Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "❌ ms-curso: Error instalando dependencias" -ForegroundColor Red
}
Set-Location -Path ".."
Write-Host ""

# ms-inscripcion
Write-Host "📝 Instalando dependencias de ms-inscripcion..." -ForegroundColor Yellow
Set-Location -Path "ms-inscripcion"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ms-inscripcion: Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "❌ ms-inscripcion: Error instalando dependencias" -ForegroundColor Red
}
Set-Location -Path ".."
Write-Host ""

# ms-gateway
Write-Host "🌐 Instalando dependencias de ms-gateway..." -ForegroundColor Yellow
Set-Location -Path "ms-gateway"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ms-gateway: Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "❌ ms-gateway: Error instalando dependencias" -ForegroundColor Red
}
Set-Location -Path ".."
Write-Host ""

Write-Host "✅ Instalación completa!" -ForegroundColor Green
Write-Host ""
Write-Host "Siguiente paso:" -ForegroundColor Cyan
Write-Host "  docker-compose up --build" -ForegroundColor White
