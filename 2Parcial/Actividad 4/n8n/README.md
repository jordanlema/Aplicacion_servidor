# n8n - Automatización de Workflows

## 🚀 Inicio Rápido

```powershell
# 1. Iniciar n8n
docker-compose up -d

# 2. Acceder
# URL: http://localhost:5678
# Usuario: admin
# Contraseña: admin123

# 3. Importar workflows desde workflows/
```

## 📂 Estructura

```
n8n/
├── docker-compose.yml          # Configuración de Docker
├── workflows/                  # Workflows exportados
│   ├── 01-notificacion-tiempo-real.json
│   ├── 02-sincronizacion-sheets.json
│   └── 03-alerta-critica.json
└── README.md                   # Este archivo
```

## 🔗 Webhooks Disponibles

### Workflow 1: Notificación en Tiempo Real
```
POST http://localhost:5678/webhook/inscripcion.creada
```

### Workflow 2: Sincronización Google Sheets
```
POST http://localhost:5678/webhook/eventos
```

### Workflow 3: Alertas Críticas
```
POST http://localhost:5678/webhook/alertas
```

## ⚙️ Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env` en esta carpeta:

```env
# Telegram
TELEGRAM_CHAT_ID=tu_chat_id

# Google Sheets
GOOGLE_SHEETS_ID=tu_spreadsheet_id

# Email
EMAIL_FROM=tu_email@gmail.com
EMAIL_ADMIN=admin@ejemplo.com
```

### 2. Credenciales en n8n

Debes configurar:
- **Telegram API** (Workflows 1 y 3)
- **Google Sheets OAuth2** (Workflow 2)
- **Gemini API** (Workflows 1 y 3)
- **SMTP** (Workflow 3)

Ver guía completa: [../docs/CONFIGURACION.md](../docs/CONFIGURACION.md)

## 📋 Comandos Útiles

```powershell
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f n8n

# Detener
docker-compose down

# Reiniciar
docker-compose restart

# Ver estado
docker-compose ps
```

## 🧪 Probar Workflows

```powershell
# Test rápido
curl -X POST http://localhost:5678/webhook/inscripcion.creada `
  -H "Content-Type: application/json" `
  -d '{
    "tipo": "inscripcion.creada",
    "timestamp": "2026-01-13T10:00:00Z",
    "datos": {
      "inscripcion_id": "TEST-001",
      "curso_nombre": "Node.js",
      "estudiante_nombre": "Test User",
      "estudiante_email": "test@ejemplo.com"
    }
  }'
```

Ver más ejemplos: [../docs/EJEMPLOS-PETICIONES.md](../docs/EJEMPLOS-PETICIONES.md)

## 📊 Acceso a la Interfaz

- **URL:** http://localhost:5678
- **Usuario:** `admin`
- **Contraseña:** `admin123`

⚠️ **Importante:** Cambia estas credenciales en producción.

## 🔧 Troubleshooting

### n8n no inicia
```powershell
# Ver logs
docker-compose logs n8n

# Verificar puerto
netstat -ano | findstr :5678
```

### Workflows no ejecutan
1. Verifica que estén activos (toggle verde)
2. Revisa las credenciales
3. Ve a Executions para ver errores

### PostgreSQL falla
```powershell
# Reiniciar contenedor
docker-compose restart postgres

# Ver logs
docker-compose logs postgres
```

## 📚 Documentación

- [README Principal](../README.md)
- [Instalación](../docs/INSTALACION.md)
- [Configuración](../docs/CONFIGURACION.md)
- [Workflows](../docs/WORKFLOWS.md)
- [Integraciones](../docs/INTEGRACIONES.md)

## 🔒 Seguridad

### Para Producción

1. **Cambiar credenciales:**
   ```yaml
   N8N_BASIC_AUTH_USER=usuario_seguro
   N8N_BASIC_AUTH_PASSWORD=contraseña_compleja
   ```

2. **Usar HTTPS:**
   ```yaml
   N8N_PROTOCOL=https
   N8N_HOST=tu-dominio.com
   ```

3. **Proteger webhooks:**
   - Agregar tokens de autenticación
   - Usar firmas HMAC
   - Filtrar por IP

## 💾 Backup

```powershell
# Exportar workflows
docker exec n8n-workflow-automation n8n export:workflow --all --output=/tmp/workflows.json
docker cp n8n-workflow-automation:/tmp/workflows.json ./backup-workflows.json

# Backup de base de datos
docker exec n8n-postgres pg_dump -U n8n n8n > backup-db.sql
```

## 🆘 Soporte

- [Documentación oficial de n8n](https://docs.n8n.io/)
- [Community Forum](https://community.n8n.io/)
- [GitHub Issues](https://github.com/n8n-io/n8n/issues)

---

**Versión:** 1.0  
**Última actualización:** Enero 2026
