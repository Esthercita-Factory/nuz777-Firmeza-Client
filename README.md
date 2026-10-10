# Firmeza Web Client (Frontend SPA)

Aplicación web cliente (Frontend SPA) desarrollada en **Angular** y **Tailwind CSS** para la plataforma de Ferretería Firmeza.

## Requisitos
- Node.js >= 22
- npm >= 10
- Docker (opcional, para ejecución contenerizada)

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en http://localhost:4200
npm start

# Ejecutar suite de pruebas unitarias
npm test -- --watch=false

# Compilar para producción
npm run build
```

## Ejecución con Docker

### Construir y levantar localmente:
```bash
docker compose up -d --build
```
La aplicación estará disponible en `http://localhost:8081`.

### Imagen Docker en GHCR:
La imagen oficial se publica automáticamente mediante GitHub Actions en:
`ghcr.io/esthercita-factory/nuz777-firmeza-client:latest`
