# Etapa 1: Compilación de la aplicación Angular
FROM node:22-alpine AS build
WORKDIR /app

# Copiar dependencias e instalarlas
COPY package*.json ./
RUN npm ci

# Copiar código fuente y compilar en modo producción
COPY . .
RUN npm run build

# Etapa 2: Servidor web Nginx para producción
FROM nginx:alpine AS final

# Limpiar archivos HTML por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar archivos compilados del navegador
COPY --from=build /app/dist/client/browser /usr/share/nginx/html

# Copiar configuración personalizada de Nginx para SPA (rutas Angular)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
