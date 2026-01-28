# 🚀 Inicio Rápido - n8n Workflows

## ⚡ Quick Start (5 minutos)

### 1. Levantar n8n

```powershell
cd "Actividad 4/n8n"
docker-compose up -d
```

### 2. Acceder

- URL: http://localhost:5678
- Usuario: `admin`
- Contraseña: `admin123`

### 3. Importar Workflows

1. Click en **Workflows** → **Import from File**
2. Importa los 3 archivos:
   - `01-notificacion-tiempo-real.json`
   - `02-sincronizacion-sheets.json`
   - `03-alerta-critica.json`
3. Activa cada workflow (toggle verde)

### 4. Configurar Credenciales Básicas

#### Telegram (obligatorio para Workflow 1 y 3)
- Bot Token: Obtén de [@BotFather](https://t.me/botfather)
- Chat ID: Envía mensaje al bot y usa `https://api.telegram.org/bot<TOKEN>/getUpdates`

#### Google Sheets (obligatorio para Workflow 2)
- Crea proyecto en [Google Cloud Console](https://console.cloud.google.com)
- Habilita Google Sheets API
- Configura OAuth 2.0
- Crea una hoja con pestaña "Eventos"

#### Gemini (obligatorio para Workflow 1 y 3)
- API Key: [Google AI Studio](https://makersuite.google.com/app/apikey)

### 5. Probar un Workflow

```powershell
curl -X POST http://localhost:5678/webhook/inscripcion.creada `
  -H "Content-Type: application/json" `
  -d '{
    "tipo": "inscripcion.creada",
    "timestamp": "2026-01-13T10:00:00Z",
    "datos": {
      "inscripcion_id": "123",
      "curso_id": "456",
      "curso_nombre": "Node.js Básico",
      "estudiante_nombre": "Juan Pérez",
      "estudiante_email": "juan@ejemplo.com",
      "fecha_inscripcion": "2026-01-13T10:00:00Z"
    },
    "metadata": {
      "origen": "ms-inscripcion",
      "version": "1.0"
    }
  }'
```

¡Deberías recibir una notificación en Telegram! 🎉

---

## 📚 Documentación Completa

- [README Principal](../README.md) - Visión general del proyecto
- [INSTALACION.md](docs/INSTALACION.md) - Guía detallada de instalación
- [CONFIGURACION.md](docs/CONFIGURACION.md) - Configuración de credenciales
- [WORKFLOWS.md](docs/WORKFLOWS.md) - Explicación de workflows
- [INTEGRACIONES.md](docs/INTEGRACIONES.md) - Integración con backend

---

## ❓ Preguntas Frecuentes

**P: ¿Necesito tener los talleres anteriores funcionando?**  
R: Sí, especialmente el Taller 1 (Backend NestJS) para emitir eventos.

**P: ¿Puedo usar otro servicio en vez de Telegram?**  
R: Sí, n8n soporta Slack, Discord, Email, SMS, etc.

**P: ¿Los workflows se ejecutan automáticamente?**  
R: Sí, una vez activos, responden a webhooks automáticamente.

**P: ¿Cómo detengo n8n?**  
R: `docker-compose down` en la carpeta n8n/

---

## 🆘 Ayuda

Si tienes problemas:

1. Revisa [INSTALACION.md](docs/INSTALACION.md) → Troubleshooting
2. Verifica logs: `docker-compose logs -f n8n`
3. Verifica que Docker esté corriendo
4. Asegúrate de tener los puertos libres (5678)

---

## 🎯 Checklist de Validación

- [ ] n8n accesible en http://localhost:5678
- [ ] 3 workflows importados y activos
- [ ] Credenciales configuradas (al menos Telegram)
- [ ] Test exitoso de al menos 1 workflow
- [ ] Backend emitiendo eventos (si tienes Taller 1)

¡Éxito! Ahora tienes automatización de workflows con IA 🤖✨
