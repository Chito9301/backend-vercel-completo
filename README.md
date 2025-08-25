# Backend Serverless Completo para Vercel (Optimizado)

Endpoints listos y compatibles con tu frontend (`lib/api-backend.ts`):

## Auth
- POST `/api/auth/signup` → `{ username, email, password }` → devuelve `{ user:{id,username,email}, token }`
- POST `/api/auth/login` → `{ email, password }` → devuelve `{ user:{id,username,email}, token }`
- POST `/api/auth/logout` → (stateless; el frontend borra el token)

## Usuario
- GET `/api/user/profile` (Bearer) → `{ id, username, email }`

## Media
- GET `/api/media` → `{ items }`
- POST `/api/media` (Bearer) → **3 formas** (se elige una):
  - `multipart/form-data` con campo **file** (también acepta `upload`, `image`, `media`)
  - `url` (subida por URL remota)
  - `dataUrl` (base64)
  - Opcionales: `upload_preset`, `resource_type` (`image` | `video` | `raw`, por defecto `auto`)
- GET `/api/media/[id]` → `{ item }`
- DELETE `/api/media/[id]` (Bearer) → `{ ok: true }`

### Upload directo recomendado (archivos grandes)
- POST `/api/media/signature` (Bearer) → devuelve firma/timestamp para que el **cliente** suba directo a Cloudinary usando el widget o fetch al endpoint de upload. Evita límites de tamaño/tiempo en serverless.

---

## Estructura
- `/api/**` → cada endpoint es una función serverless
- `/lib/db.ts` → conexión MongoDB **singleton**
- `/lib/jwt.ts` → firma/verificación JWT + extracción Bearer
- `/lib/cloudinary.ts` → configuración (usa `CLOUDINARY_URL` si existe)
- `/models/User.ts` → `username`, `email`, `password` (+ hash)
- `/models/Media.ts` → metadatos de Cloudinary (url, publicId, resourceType, ...)

## Variables de entorno (Vercel → Project Settings → Environment Variables)
- `MONGODB_URI` (obligatoria)
- `JWT_SECRET` (obligatoria)
- Cloudinary (elige una forma):
  - `CLOUDINARY_URL` (recomendada)
  - ó `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- (opcional) `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (nombre de tu preset)
- (opcional) `NEXT_PUBLIC_API_URL` (para el frontend)

## Desarrollo local
```bash
npm i
vercel dev
```
> Coloca un `.env` basado en `.env.example` (también funciona con `dotenv` en local).

## Notas de optimización
- Sin Express, sin Multer → menos cold start y menos peso.
- Formidable para multipart + `upload_stream` a Cloudinary (serverless-friendly).
- `resource_type: "auto"` permite imágenes, videos y audios (raw).
- Endpoint `/api/media/signature` para **client-direct upload** (ideal para archivos pesados).

## Seguridad
- No commitees `.env`. Rotar las credenciales que compartiste públicamente antes de desplegar.
