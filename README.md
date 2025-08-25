# Backend Vercel (TS directo en /api) — Completo y Optimizado

## Endpoints
- **Auth**
  - POST `/api/auth/signup` → `{ username, email, password }` → `{ user:{id,username,email}, token }`
  - POST `/api/auth/login`  → `{ email, password }` → `{ user:{id,username,email}, token }`
  - POST `/api/auth/logout` → `{ message }`
- **User**
  - GET `/api/user/profile` (Bearer) → `{ id, username, email }`
- **Media**
  - GET `/api/media` → `{ items }`
  - POST `/api/media` (Bearer) → subida **multipart (file)**, **url** o **dataUrl (base64)**; `resource_type`: `image|video|raw`
  - GET `/api/media/[id]` → `{ item }`
  - DELETE `/api/media/[id]` (Bearer) → `{ ok: true }`
  - POST `/api/media/signature` (Bearer) → retorna firma/timestamp para **client-direct upload** a Cloudinary

## Por qué funciona sin `index.ts`
Vercel detecta automáticamente los archivos `.ts` dentro de `/api` como **serverless functions**.
No uses `build command` (déjalo vacío); Vercel transpila TypeScript solo.

## Variables de entorno
- `MONGODB_URI`, `JWT_SECRET`
- `CLOUDINARY_URL` (o `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
- Opcional: `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`, `NEXT_PUBLIC_API_URL`

## Desarrollo local
```bash
npm i
vercel dev
```

## Notas
- Subida grande: usa `POST /api/media/signature` y sube **directo desde el cliente** al endpoint de Cloudinary.
- `resource_type: "auto"` soporta imágenes, videos y audio (como `raw`).
