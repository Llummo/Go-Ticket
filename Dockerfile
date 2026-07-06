# Etapa 1: Compilación
FROM node:20-alpine AS build-stage
WORKDIR /app
# Copiamos los archivos de dependencias primero para aprovechar el caché de Docker
COPY package*.json ./
RUN npm install
# Copiamos el resto del código y compilamos
COPY . .
RUN npm run build

# Etapa 2: Producción
FROM nginx:alpine AS production-stage
# Copiamos la carpeta dist (resultado del build de Vue) al directorio público de Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Exponemos el puerto estándar web
EXPOSE 80
# Arrancamos el servidor
CMD ["nginx", "-g", "daemon off;"]