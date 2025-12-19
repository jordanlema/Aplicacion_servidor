# ⚠️ NOTA SOBRE ERRORES DE VS CODE

## Edge Functions (Deno Runtime)

Los archivos en `supabase/functions/` muestran errores en VS Code porque están escritos para **Deno runtime**, no Node.js.

### Errores Esperados (NORMALES)

```
❌ No se encuentra el módulo "https://deno.land/std@0.168.0/http/server.ts"
❌ No se encuentra el nombre 'Deno'
```

### ¿Por qué?

- VS Code usa el compilador de TypeScript de **Node.js**
- Las Edge Functions corren en **Deno** (diferente runtime)
- Deno permite imports desde URLs
- Deno tiene su propia API global (`Deno.env`, etc.)

### ¿Funcionarán los archivos?

✅ **SÍ**, funcionarán perfectamente cuando se desplieguen en Supabase.

El runtime de Supabase Edge Functions es Deno, que entiende perfectamente este código.

### Verificar Sintaxis (Opcional)

Si quieres verificar la sintaxis antes de deployment:

```bash
# Instalar Deno
winget install deno

# Verificar sintaxis
deno check supabase/functions/event-logger/index.ts
deno check supabase/functions/notifier/index.ts
```

### Ignorar Errores

Puedes ignorar estos errores de VS Code. Los archivos TypeScript en `ms-curso` y `ms-inscripcion` sí deben estar sin errores (y lo están).

---

## Resumen

| Archivo | Runtime | Errores VS Code |
|---------|---------|-----------------|
| `ms-curso/**/*.ts` | Node.js | ❌ No debe tener |
| `ms-inscripcion/**/*.ts` | Node.js | ❌ No debe tener |
| `supabase/functions/**/*.ts` | Deno | ✅ Ignorar |

---

**✨ Todo está correcto. Los errores de las Edge Functions son esperados.**
