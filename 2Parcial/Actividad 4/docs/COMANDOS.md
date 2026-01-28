# 🎯 Comandos Útiles - n8n

Colección de comandos útiles para trabajar con n8n y Docker.

## 🐳 Docker & Docker Compose

### Gestión de Contenedores

```powershell
# Iniciar n8n
cd "Actividad 4/n8n"
docker-compose up -d

# Detener n8n (preserva datos)
docker-compose down

# Detener y eliminar datos
docker-compose down -v

# Reiniciar n8n
docker-compose restart

# Reiniciar solo n8n (no postgres)
docker-compose restart n8n

# Ver estado de contenedores
docker-compose ps

# Ver todos los contenedores Docker
docker ps -a
```

### Logs y Debugging

```powershell
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs solo de n8n
docker-compose logs -f n8n

# Ver últimas 100 líneas
docker-compose logs --tail=100 n8n

# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Buscar en logs
docker-compose logs n8n | Select-String "error"
docker-compose logs n8n | Select-String "webhook"

# Exportar logs a archivo
docker-compose logs n8n > logs-n8n.txt
```

### Gestión de Volúmenes

```powershell
# Listar volúmenes
docker volume ls

# Inspeccionar volumen de n8n
docker volume inspect n8n_n8n_data

# Inspeccionar volumen de postgres
docker volume inspect n8n_postgres_data

# Eliminar volúmenes huérfanos
docker volume prune

# Backup de volumen n8n
docker run --rm `
  -v n8n_n8n_data:/data `
  -v ${PWD}:/backup `
  alpine tar czf /backup/n8n-backup.tar.gz /data

# Restaurar backup
docker run --rm `
  -v n8n_n8n_data:/data `
  -v ${PWD}:/backup `
  alpine tar xzf /backup/n8n-backup.tar.gz -C /
```

### Actualización de n8n

```powershell
# Detener contenedores
docker-compose down

# Descargar última versión
docker-compose pull

# Iniciar con nueva versión
docker-compose up -d

# Verificar versión
docker exec n8n-workflow-automation n8n --version
```

## 🔧 n8n CLI

### Acceso al Contenedor

```powershell
# Acceder a shell del contenedor
docker exec -it n8n-workflow-automation /bin/sh

# Ejecutar comando único
docker exec n8n-workflow-automation n8n --version
```

### Exportar e Importar Workflows

```powershell
# Exportar todos los workflows
docker exec n8n-workflow-automation n8n export:workflow --all --output=/tmp/workflows.json

# Copiar al host
docker cp n8n-workflow-automation:/tmp/workflows.json ./backup-workflows.json

# Exportar workflow específico (por ID)
docker exec n8n-workflow-automation n8n export:workflow --id=1 --output=/tmp/workflow-1.json

# Importar workflow
docker cp workflow.json n8n-workflow-automation:/tmp/
docker exec n8n-workflow-automation n8n import:workflow --input=/tmp/workflow.json

# Importar con separación
docker exec n8n-workflow-automation n8n import:workflow --input=/tmp/workflow.json --separate
```

### Gestión de Credenciales

```powershell
# Exportar credenciales (requiere clave de encriptación)
docker exec n8n-workflow-automation n8n export:credentials --all --output=/tmp/credentials.json

# Copiar al host
docker cp n8n-workflow-automation:/tmp/credentials.json ./backup-credentials.json

# Importar credenciales
docker cp credentials.json n8n-workflow-automation:/tmp/
docker exec n8n-workflow-automation n8n import:credentials --input=/tmp/credentials.json
```

## 🌐 Pruebas de Webhooks

### Usando PowerShell

```powershell
# Headers comunes
$headers = @{ "Content-Type" = "application/json" }

# Test básico
Invoke-RestMethod -Uri "http://localhost:5678/webhook/test" `
  -Method POST `
  -Headers $headers `
  -Body '{"mensaje": "Hola n8n"}'

# Test con archivo
$body = Get-Content test-data.json
Invoke-RestMethod -Uri "http://localhost:5678/webhook/test" `
  -Method POST `
  -Headers $headers `
  -Body $body

# Ver respuesta completa
Invoke-WebRequest -Uri "http://localhost:5678/webhook/test" `
  -Method POST `
  -Headers $headers `
  -Body '{"test": true}' | Format-List
```

### Usando curl (desde Git Bash o WSL)

```bash
# Test básico
curl -X POST http://localhost:5678/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"mensaje": "Hola n8n"}'

# Test con archivo
curl -X POST http://localhost:5678/webhook/test \
  -H "Content-Type: application/json" \
  -d @test-data.json

# Ver headers de respuesta
curl -i -X POST http://localhost:5678/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Con timeout
curl --max-time 5 -X POST http://localhost:5678/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## 📊 Monitoreo

### Health Checks

```powershell
# Verificar que n8n responde
Invoke-RestMethod -Uri "http://localhost:5678/healthz"

# Verificar PostgreSQL desde Docker
docker exec n8n-postgres pg_isready -U n8n

# Ver estadísticas de contenedor
docker stats n8n-workflow-automation

# Ver uso de recursos
docker exec n8n-workflow-automation top
```

### Logs Específicos

```powershell
# Logs de errores
docker-compose logs n8n | Select-String "ERROR"

# Logs de webhooks
docker-compose logs n8n | Select-String "webhook"

# Logs de ejecuciones
docker-compose logs n8n | Select-String "execution"

# Logs con timestamp
docker-compose logs -t n8n

# Logs desde fecha específica
docker-compose logs --since="2026-01-13T10:00:00" n8n
```

## 🗄️ PostgreSQL

### Acceso a Base de Datos

```powershell
# Acceder a psql
docker exec -it n8n-postgres psql -U n8n -d n8n

# Ejecutar query directamente
docker exec n8n-postgres psql -U n8n -d n8n -c "SELECT * FROM workflow_entity;"

# Backup de base de datos
docker exec n8n-postgres pg_dump -U n8n n8n > backup-db.sql

# Restaurar base de datos
Get-Content backup-db.sql | docker exec -i n8n-postgres psql -U n8n -d n8n
```

### Queries Útiles

```sql
-- Ver workflows
SELECT id, name, active FROM workflow_entity;

-- Ver ejecuciones recientes
SELECT id, workflow_id, finished, "startedAt" 
FROM execution_entity 
ORDER BY "startedAt" DESC 
LIMIT 10;

-- Ver credenciales
SELECT id, name, type FROM credentials_entity;

-- Limpiar ejecuciones antiguas
DELETE FROM execution_entity 
WHERE "startedAt" < NOW() - INTERVAL '30 days';
```

## 🧹 Limpieza y Mantenimiento

### Limpiar Sistema

```powershell
# Eliminar contenedores detenidos
docker container prune -f

# Eliminar imágenes no usadas
docker image prune -a -f

# Eliminar volúmenes no usados
docker volume prune -f

# Eliminar redes no usadas
docker network prune -f

# Limpieza completa
docker system prune -a --volumes -f

# Ver espacio usado por Docker
docker system df
```

### Reinicio Completo

```powershell
# Detener todo
docker-compose down -v

# Limpiar imágenes de n8n
docker rmi n8nio/n8n:latest
docker rmi postgres:15-alpine

# Volver a descargar
docker-compose pull

# Iniciar desde cero
docker-compose up -d
```

## 🔐 Seguridad

### Cambiar Contraseñas

```powershell
# Editar docker-compose.yml o .env
# Cambiar N8N_BASIC_AUTH_PASSWORD

# Reiniciar para aplicar
docker-compose down
docker-compose up -d
```

### Variables de Entorno

```powershell
# Ver variables de entorno del contenedor
docker exec n8n-workflow-automation env | Sort-Object

# Ver variable específica
docker exec n8n-workflow-automation printenv N8N_BASIC_AUTH_USER
```

## 📦 Backup Completo

### Script de Backup

```powershell
# Crear carpeta de backup
$backupDir = "backup-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"
New-Item -ItemType Directory -Path $backupDir

# Exportar workflows
docker exec n8n-workflow-automation n8n export:workflow --all --output=/tmp/workflows.json
docker cp n8n-workflow-automation:/tmp/workflows.json "$backupDir/workflows.json"

# Backup de base de datos
docker exec n8n-postgres pg_dump -U n8n n8n > "$backupDir/database.sql"

# Backup de volúmenes
docker run --rm `
  -v n8n_n8n_data:/data `
  -v ${PWD}/${backupDir}:/backup `
  alpine tar czf /backup/n8n-data.tar.gz /data

Write-Host "✅ Backup completo en: $backupDir"
```

## 🚀 Optimización

### Configuración de Rendimiento

```yaml
# En docker-compose.yml
environment:
  # Aumentar workers
  - N8N_WORKERS_COUNT=4
  
  # Configurar timeout
  - EXECUTIONS_TIMEOUT=3600
  
  # Limitar memoria
  - NODE_OPTIONS=--max-old-space-size=2048
```

### Limpiar Ejecuciones Antiguas

```powershell
# Acceder a PostgreSQL
docker exec -it n8n-postgres psql -U n8n -d n8n

# Ejecutar
DELETE FROM execution_entity WHERE "startedAt" < NOW() - INTERVAL '7 days';
```

## 🔍 Debugging

### Modo Debug

```yaml
# En docker-compose.yml
environment:
  - N8N_LOG_LEVEL=debug
  - N8N_LOG_OUTPUT=console
```

### Ver Request/Response

```powershell
# Activar logs verbose
docker-compose logs -f n8n | Select-String "request\|response"
```

## 📋 Checklist de Mantenimiento

### Diario
- [ ] Verificar logs de errores
- [ ] Verificar que workflows estén activos
- [ ] Verificar ejecuciones fallidas

### Semanal
- [ ] Revisar uso de disco
- [ ] Limpiar ejecuciones antiguas
- [ ] Verificar actualizaciones

### Mensual
- [ ] Backup completo
- [ ] Actualizar n8n
- [ ] Revisar credenciales
- [ ] Optimizar base de datos

## 🆘 Comandos de Emergencia

```powershell
# n8n no responde
docker-compose restart n8n

# Base de datos corrupta
docker-compose down
docker volume rm n8n_postgres_data
docker-compose up -d

# Puerto ocupado
netstat -ano | findstr :5678
taskkill /PID <PID> /F

# Docker no responde
Restart-Service docker

# Logs llenos
docker-compose logs --tail=0 -f n8n
```

## 📚 Referencias

- [Docker CLI Reference](https://docs.docker.com/engine/reference/commandline/cli/)
- [n8n CLI Documentation](https://docs.n8n.io/hosting/cli-commands/)
- [Docker Compose CLI](https://docs.docker.com/compose/reference/)
