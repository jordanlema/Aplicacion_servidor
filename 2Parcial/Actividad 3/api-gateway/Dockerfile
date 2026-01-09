FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del API Gateway
COPY api-gateway/package*.json ./
RUN npm install

# Copiar código del API Gateway
COPY api-gateway/ .

# Copiar MCP Server desde el contexto de build (directorio raíz Actividad 3)
COPY mcp-server /app/mcp-server

# Compilar API Gateway
RUN npm run build

CMD ["npm", "start"]
