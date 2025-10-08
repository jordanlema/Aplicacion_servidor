# Generar y visualizar el ERD (diagrama entidad-relación)

Este proyecto incluye un script seguro para generar un ERD en formato Mermaid (`erd.mmd`) usando la metadata de TypeORM y la configuración de `AppDataSource`.

Dónde está el archivo generado
- `erd.mmd` se escribe en la raíz del proyecto cuando ejecutas el script.

Instrucciones rápidas (PowerShell)

1) Instala dependencias si aún no lo hiciste:

```powershell
npm install
```

2) Generar el ERD (usa el script que ya está añadido en `package.json`):

```powershell
npm run generate-erd
```

3) Ver el archivo `erd.mmd`:

- Puedes abrir `erd.mmd` en VS Code y usar alguna extensión para renderizar Mermaid (por ejemplo: "Markdown Preview Enhanced" o "Mermaid Preview").
- También puedes usar el visor online de Mermaid: https://mermaid.live/ — pega el contenido y verás el diagrama.

Convertir a PNG/SVG (opcional)

Si quieres una imagen local (PNG/SVG) puedes instalar la CLI de Mermaid y convertir:

```powershell
# instalar localmente como dev-dep (recomendado)
npm install --save-dev @mermaid-js/mermaid-cli

# convertir a PNG
npx mmdc -i erd.mmd -o erd.png

# convertir a SVG
npx mmdc -i erd.mmd -o erd.svg
```

Notas y seguridad
- El script `scripts/generate-erd.ts` inicializa `AppDataSource`. Eso puede crear/abrir la base de datos sqlite si tu configuración lo permite. Si no quieres que se ejecute la inicialización, revisa el script primero.
- No fue necesario cambiar tus dependencias principales. `typeorm-erd` se instaló con `--legacy-peer-deps` pero el script que añadimos no depende de él; es seguro mantener tu versión actual de `reflect-metadata` y `typeorm`.
- Si quieres que automatice además la conversión a PNG/SVG o añada el README oficial al README principal, dime y lo hago.

Contacto rápido
- Ejecuta `npm run generate-erd` y dime si quieres que genere la imagen automáticamente.
