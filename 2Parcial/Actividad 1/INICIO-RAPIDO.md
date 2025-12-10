# 🚀 GUÍA RÁPIDA DE INICIO

## Pasos para levantar el proyecto

### 1. Instalar dependencias
```powershell
# En cada microservicio
cd ms-animal
npm install

cd ../ms-adoption  
npm install

cd ../ms-gateway
npm install

cd ..
```

### 2. Levantar servicios con Docker
```powershell
docker-compose up --build
```

### 3. Verificar que todo está corriendo
Espera unos 30 segundos y verifica:
- ✅ RabbitMQ: http://localhost:15672 (guest/guest)
- ✅ ms-gateway: http://localhost:3000
- ✅ ms-curso: logs muestran "👂 Listening to curso_queue..."
- ✅ ms-inscripcion: logs muestran "📚 ms-inscripcion running on port 3002"
- ✅ Redis: logs muestran "✅ Conectado a Redis"

### 4. Crear datos de prueba
```powershell
.\seed-data.ps1
```

Copia uno de los `curso_id` que aparece en los logs de `ms-curso`.

### 5. Probar idempotencia

**Opción A: Con Postman/Insomnia**

1. Crear inscripción:
```
POST http://localhost:3000/inscripciones
Content-Type: application/json

{
  "curso_id": "PEGAR_ID_AQUÍ",
  "estudiante_nombre": "Juan Pérez",
  "estudiante_email": "juan@test.com",
  "idempotency_key": "mi-key-unica-123"
}
```

2. Enviar EXACTAMENTE la misma petición de nuevo
3. La segunda respuesta debe mostrar `"isNew": false`

**Opción B: Con script PowerShell**
```powershell
# Edita test-idempotencia.ps1 y reemplaza REEMPLAZAR_CON_ID_REAL
.\test-idempotencia.ps1
```

### 6. Verificar idempotencia en los logs

En los logs de `ms-curso` deberías ver:

```
Primera vez:
🆕 Mensaje nuevo - Procesando reserva de cupo...
✅ Cupo reservado...

Segunda vez:
⚠️  Mensaje DUPLICADO detectado - Reserva ya procesada (idempotencia aplicada)
   ✅ RESILIENCIA DEMOSTRADA: El sistema evitó reservar el cupo dos veces
```

---

## 🎯 Demostración para la Clase

### Flujo Simple:
1. **Levantar**: `docker-compose up`
2. **Seed**: `.\seed-data.ps1` (copia un ID de curso)
3. **Crear inscripción** (Postman con idempotency_key)
4. **Duplicar** (misma petición, mismo key)
5. **Mostrar**: logs donde dice "DUPLICADO detectado"
6. **Explicar**: Segunda llamada no reservó otro cupo

### Puntos a Mencionar:
- ✅ Patrón: **Idempotent Consumer**
- ✅ Tecnología: **Redis con SET NX** (operación atómica)
- ✅ Problema: Evita doble procesamiento de mensajes
- ✅ Solución: Registra messageId antes de procesar
- ✅ Beneficio: Un mensaje duplicado no afecta la lógica de negocio

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to Redis"
```powershell
docker-compose restart redis
docker-compose logs redis
```

### Error: "Course not found"
- Verifica que ejecutaste `.\seed-data.ps1`
- Copia el ID correcto de los logs

### Error: Puerto ya en uso
```powershell
# Detener todo
docker-compose down

# Verificar puertos
netstat -ano | findstr "3000 3001 3002 5672 6379"

# Levantar de nuevo
docker-compose up
```

---

## 📦 Archivos Importantes

- `docker-compose.yml` - Configuración de servicios
- `README.md` - Documentación completa
- `seed-data.ps1` - Crear cursos de prueba
- `test-idempotencia.ps1` - Prueba automatizada

---

## ✅ Checklist Pre-Presentación

- [ ] `docker-compose up` funciona sin errores
- [ ] RabbitMQ accesible en localhost:15672
- [ ] Redis muestra "✅ Conectado" en logs
- [ ] `seed-data.ps1` crea cursos exitosamente
- [ ] Prueba manual de idempotencia funciona
- [ ] Logs muestran "DUPLICADO detectado" en segunda llamada
- [ ] Tienes los IDs de curso listos para la demo
