# 📦 Guía de Instalación - n8n

## Requisitos Previos

### Software Necesario

- **Docker Desktop** (versión 20.10+)
  - Descargar: https://www.docker.com/products/docker-desktop
  
- **Docker Compose** (incluido en Docker Desktop)
  - Versión mínima: 1.29+

- **Git** (para clonar repositorio)
  - Descargar: https://git-scm.com/downloads

### Verificar Instalación

```powershell
# Verificar Docker
docker --version
# Debe mostrar: Docker version 20.10.x o superior

# Verificar Docker Compose
docker-compose --version
# Debe mostrar: Docker Compose version 1.29.x o superior

# Verificar que Docker está corriendo
docker ps
# Debe mostrar la lista de contenedores (puede estar vacía)
```

## Instalación Paso a Paso

### 1. Preparar el Entorno

```powershell
# Navegar a la carpeta del proyecto
cd "C:\Users\Lenovo\Desktop\jj\Actividad 4\n8n"

# Verificar estructura
ls
```

Deberías ver:
- `docker-compose.yml`
- `workflows/` (carpeta con los archivos JSON)

### 2. Configurar Variables de Entorno (Opcional)

Crea un archivo `.env` en la carpeta `n8n/`:

```env
# Autenticación básica
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=admin123

# URL base
N8N_HOST=localhost
N8N_PORT=5678

# Zona horaria
GENERIC_TIMEZONE=America/Bogota
TZ=America/Bogota
```

### 3. Iniciar n8n con Docker

```powershell
# Iniciar contenedores en modo detached
docker-compose up -d

# Verificar que los contenedores están corriendo
docker-compose ps
```

Deberías ver dos contenedores:
- `n8n-workflow-automation` (Estado: Up)
- `n8n-postgres` (Estado: Up, healthy)

### 4. Verificar Logs

```powershell
# Ver logs en tiempo real
docker-compose logs -f n8n

# Presiona Ctrl+C para salir
```

Busca el mensaje:
```
n8n ready on port 5678
```

### 5. Acceder a n8n

1. Abre tu navegador
2. Navega a: http://localhost:5678
3. Inicia sesión:
   - Usuario: `admin`
   - Contraseña: `admin123`

## Estructura de Volúmenes

Docker Compose crea volúmenes persistentes para:

```
n8n_data/        # Workflows, credenciales, ejecuciones
postgres_data/   # Base de datos PostgreSQL
```

Para inspeccionar los volúmenes:

```powershell
# Listar volúmenes
docker volume ls

# Ver detalles
docker volume inspect n8n_n8n_data
docker volume inspect n8n_postgres_data
```

## Troubleshooting

### Problema: Puerto 5678 ya está en uso

**Error:**
```
Error starting userland proxy: listen tcp 0.0.0.0:5678: bind: address already in use
```

**Solución:**
```powershell
# Identificar el proceso usando el puerto
netstat -ano | findstr :5678

# Terminar el proceso (reemplaza PID con el número mostrado)
taskkill /PID <PID> /F

# O cambiar el puerto en docker-compose.yml:
# ports:
#   - "5679:5678"
```

### Problema: Docker no inicia

**Error:**
```
Cannot connect to the Docker daemon
```

**Solución:**
1. Abre Docker Desktop
2. Espera a que muestre "Docker Desktop is running"
3. Intenta nuevamente: `docker ps`

### Problema: Contenedor n8n se detiene

**Síntoma:** El contenedor aparece como "Exited"

**Solución:**
```powershell
# Ver logs del error
docker-compose logs n8n

# Reiniciar contenedor
docker-compose restart n8n

# Si persiste, recrear contenedores
docker-compose down
docker-compose up -d
```

### Problema: PostgreSQL no inicia (healthcheck failed)

**Solución:**
```powershell
# Ver logs de PostgreSQL
docker-compose logs postgres

# Eliminar volumen y recrear
docker-compose down -v
docker-compose up -d
```

## Comandos Útiles

### Gestión de Contenedores

```powershell
# Iniciar n8n
docker-compose up -d

# Detener n8n (preserva datos)
docker-compose down

# Reiniciar n8n
docker-compose restart

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Ver logs solo de n8n
docker-compose logs -f n8n

# Ver logs de PostgreSQL
docker-compose logs -f postgres
```

### Gestión de Datos

```powershell
# Eliminar contenedores y volúmenes (CUIDADO: borra todos los datos)
docker-compose down -v

# Backup de workflows (desde dentro del contenedor)
docker exec n8n-workflow-automation n8n export:workflow --all --output=/tmp/workflows.json

# Copiar backup al host
docker cp n8n-workflow-automation:/tmp/workflows.json ./backup-workflows.json
```

### Actualización de n8n

```powershell
# Detener contenedores
docker-compose down

# Descargar nueva versión
docker-compose pull

# Iniciar con nueva versión
docker-compose up -d
```

## Instalación en Producción

### Recomendaciones

1. **Usar HTTPS:**
   ```yaml
   # En docker-compose.yml
   environment:
     - N8N_PROTOCOL=https
     - N8N_HOST=tu-dominio.com
   ```

2. **Configurar Base de Datos Externa:**
   ```yaml
   environment:
     - DB_TYPE=postgresdb
     - DB_POSTGRESDB_HOST=postgres
     - DB_POSTGRESDB_PORT=5432
     - DB_POSTGRESDB_DATABASE=n8n
     - DB_POSTGRESDB_USER=n8n
     - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
   ```

3. **Usar Secrets para Contraseñas:**
   ```powershell
   # Crear archivo .env con variables seguras
   N8N_BASIC_AUTH_PASSWORD=$(openssl rand -base64 32)
   DB_PASSWORD=$(openssl rand -base64 32)
   ```

4. **Configurar Backups Automáticos:**
   ```powershell
   # Script de backup (ejecutar con cron/Task Scheduler)
   docker exec n8n-workflow-automation n8n export:workflow --all --output=/backup/workflows-$(date +%Y%m%d).json
   ```

## Verificación Post-Instalación

### Checklist

- [ ] n8n accesible en http://localhost:5678
- [ ] Puede iniciar sesión con admin/admin123
- [ ] Ve la interfaz principal de n8n
- [ ] PostgreSQL muestra estado "healthy"
- [ ] No hay errores en los logs

### Próximos Pasos

1. [Importar Workflows](WORKFLOWS.md)
2. [Configurar Credenciales](CONFIGURACION.md)
3. [Configurar Integraciones](INTEGRACIONES.md)

## Recursos Adicionales

- [Documentación oficial de n8n](https://docs.n8n.io/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [n8n Community Forum](https://community.n8n.io/)

## Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica la [sección Troubleshooting](#troubleshooting)
3. Consulta la documentación oficial de n8n
4. Busca en el foro de la comunidad
