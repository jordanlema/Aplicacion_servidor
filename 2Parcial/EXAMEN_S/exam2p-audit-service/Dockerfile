# ============================================
# DOCKERFILE - exam2p-audit-service
# ============================================

FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar código fuente
COPY . .

# Crear directorio para la base de datos
RUN mkdir -p /app/src/db

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
