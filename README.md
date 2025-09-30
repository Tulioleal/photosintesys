# photosynthesis

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

## Client data fetching

This project now uses TanStack Query for client-side fetching and caching. Install it locally with:

```bash
npm install @tanstack/react-query
```

I added `src/providers/QueryProvider.tsx` and wrapped the app in it in `src/app/layout.tsx`. The identify flow in `src/app/page.tsx` now uses `useMutation`.

## Estilo (guidelines)

- Colores: `#BFCBB8` (primario claro), `#48644B` (primario fuerte), `#9A5E39` (acento terracota)
- Tipografías: Bodoni Moda (títulos) y Roboto (texto)
- Componentes clave: cards con borde redondeado 16px, sombras suaves, botones primarios verde y fantasma.

## API

POST `/api/identify`

Body: `{ image: string(base64 data URL) }`

Respuesta: `{ name, confidence, description?, tips[], imageUrl }`
