# Photosintesys

App móvil-first en Next.js para identificar plantas con IA (OpenAI Vision) y mostrar cuidados.

## Requisitos

- Node 18+
- Clave de API de OpenAI

## Configuración

1. Copia `.env.example` a `.env.local` y rellena `OPENAI_API_KEY`.
1. Instala dependencias:

```bash
npm install
```

1. Ejecuta en desarrollo:

```bash
npm run dev
```

## Estilo (guidelines)

- Colores: `#BFCBB8` (primario claro), `#48644B` (primario fuerte), `#9A5E39` (acento terracota)
- Tipografías: Bodoni Moda (títulos) y Roboto (texto)
- Componentes clave: cards con borde redondeado 16px, sombras suaves, botones primarios verde y fantasma.

## API

POST `/api/identify`

Body: `{ image: string(base64 data URL) }`

Respuesta: `{ name, confidence, description?, tips[], imageUrl }`
