# 🚀 GUÍA RÁPIDA: Desplegar Edge Functions

## ✅ Supabase CLI Ya Instalado

Versión instalada: **v2.65.5**

---

## 📋 PASOS PARA DESPLEGAR

### 1. Iniciar Sesión

```bash
supabase login
```

Esto abrirá tu navegador para autenticarte con tu cuenta de Supabase.

### 2. Enlazar con tu Proyecto

```bash
supabase link --project-ref TU_PROJECT_REF
```

**¿Dónde está el `project-ref`?**
- Dashboard de Supabase → Settings → General → Reference ID

### 3. Configurar Secret (IMPORTANTE)

```bash
supabase secrets set WEBHOOK_SECRET=dev-secret-key-change-in-production
```

### 4. Desplegar Edge Functions

```bash
# Desplegar event-logger
supabase functions deploy event-logger

# Desplegar notifier
supabase functions deploy notifier
```

### 5. Ver URLs Desplegadas

Después del deploy verás las URLs:
```
https://tu-proyecto.supabase.co/functions/v1/event-logger
https://tu-proyecto.supabase.co/functions/v1/notifier
```

### 6. Actualizar .env en Microservicios

Copia las URLs y actualiza el archivo `.env`:

```env
EDGE_FUNCTION_EVENT_LOGGER_URL=https://tu-proyecto.supabase.co/functions/v1/event-logger
EDGE_FUNCTION_NOTIFIER_URL=https://tu-proyecto.supabase.co/functions/v1/notifier
WEBHOOK_SECRET=dev-secret-key-change-in-production
```

---

## 🧪 COMANDOS ÚTILES

```bash
# Ver logs en tiempo real
supabase functions logs event-logger --follow
supabase functions logs notifier --follow

# Listar funciones desplegadas
supabase functions list

# Ver secrets configurados
supabase secrets list

# Actualizar una función
supabase functions deploy event-logger

# Servir funciones localmente (testing)
supabase functions serve event-logger
```

---

## 📊 WORKFLOW COMPLETO

```bash
# 1. Login
supabase login

# 2. Link
supabase link --project-ref abc123xyz

# 3. Secrets
supabase secrets set WEBHOOK_SECRET=tu-secret-aqui

# 4. Deploy
supabase functions deploy event-logger
supabase functions deploy notifier

# 5. Test
curl https://tu-proyecto.supabase.co/functions/v1/event-logger

# 6. Logs
supabase functions logs event-logger
```

---

## ⚠️ TROUBLESHOOTING

### Error: "Not logged in"
```bash
supabase login
```

### Error: "Project not linked"
```bash
supabase link --project-ref TU_PROJECT_REF
```

### Error: "Function not found"
Verifica que estés en la carpeta correcta:
```bash
cd "c:\Users\Lenovo\Desktop\jj\Actividad 1"
supabase functions deploy event-logger
```

### Actualizar CLI (hay nueva versión)
```bash
scoop update supabase
```

---

## 🎯 PRÓXIMOS PASOS

1. **Crear proyecto en Supabase** (si no lo has hecho):
   - Ve a https://supabase.com/dashboard
   - Crea nuevo proyecto
   - Guarda el Project Reference ID

2. **Ejecutar SQL Schema**:
   - Dashboard → SQL Editor
   - Pega el contenido de `supabase/schema.sql`
   - Ejecuta

3. **Seguir esta guía** para desplegar las funciones

4. **Actualizar .env** con las URLs

5. **Probar el sistema**:
   ```bash
   .\test-webhooks.ps1
   ```

---

## 📚 Documentación Completa

- [INICIO-RAPIDO-ACTIVIDAD-2.md](./INICIO-RAPIDO-ACTIVIDAD-2.md)
- [supabase/SETUP.md](./supabase/SETUP.md)
- [README-ACTIVIDAD-2.md](./README-ACTIVIDAD-2.md)

---

**✨ Ya tienes todo listo para desplegar!**

Empieza con: `supabase login`
