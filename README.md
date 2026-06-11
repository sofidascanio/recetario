# Recetario

> Aplicación web de recetas con sistema social, heladera inteligente y recomendaciones personalizadas.

Recetario es una aplicación web full-stack que permite a los usuarios:

- Crear, publicar y gestionar recetas con ingredientes y pasos detallados
- Mantener un inventario de ingredientes en su heladera con fechas de vencimiento
- Recibir recomendaciones personalizadas basadas en sus gustos y lo que tienen disponible
- Seguir a otros usuarios y ver su contenido en un feed social
- Comentar y puntuar recetas de la comunidad
- Recibir notificaciones en tiempo real de la actividad relacionada con su cuenta

```
recetario/
├── backend/     → API REST (Node.js + Express + Prisma)
└── frontend/    → SPA (React + Vite)
```

---

## Uso

### Requisitos previos

```bash
node --version   # >= 20 (recomendado 22)
npm --version    # >= 10
psql --version   # PostgreSQL 15 o 16
```

### 1. Clonar el repositorio

```bash
git clone https://github.com/sofidascanio/recetario
cd recetario
```

### 2. Configurar PostgreSQL

```bash
# Iniciar PostgreSQL
sudo service postgresql start

# Entrar como superusuario
sudo -u postgres psql
```

```sql
-- Crear usuario y base de datos dedicados
CREATE USER recetario_user WITH PASSWORD 'recetario_pass';
CREATE DATABASE recetario_dev OWNER recetario_user;
\q
```

### 3. Configurar el backend

```bash
cd backend

# Copiar y editar variables de entorno
cp .env.example .env

# Generar el cliente de Prisma y correr migraciones
npx prisma generate
npx prisma migrate dev

# (Opcional) Cargar datos de prueba
npx prisma db seed

# Iniciar en modo desarrollo
npm run dev
```

El backend esta disponible en `http://localhost:3000`.

### 4. Configurar el frontend

```bash
cd ../frontend

# Copiar variables de entorno
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api/v1

# Iniciar en modo desarrollo
npm run dev
```

El frontend esta disponible en `http://localhost:5173`.

### 5. Comandos útiles

```bash
# Backend
npx prisma studio    # UI visual de la base de datos (puerto 5555)
npx prisma migrate dev --name nombre   # crear nueva migración

```

---

## Variables de entorno

#### Backend — `.env`

```bash
# Servidor
PORT=3000
NODE_ENV=development          # development | production

# Base de datos
DATABASE_URL="postgresql://recetario_user:recetario_pass@localhost:5432/recetario_dev"

# JWT
JWT_SECRET=minimo-64-caracteres-aleatorios
JWT_EXPIRES_IN=7d

# CORS: URL del frontend
FRONTEND_URL=http://localhost:5173

# Cloudinary (necesario para imágenes)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_PRESET=
```

Para generar un JWT_SECRET seguro:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Frontend — `.env`

```bash
# URL base de la API
VITE_API_URL=http://localhost:3000/api/v1
```

---

## Arquitectura del backend

### Estructura de carpetas

```
backend/
├── prisma/
│   ├── schema.prisma        # Definición del modelo de datos
│   ├── migrations/          # Historial de migraciones SQL
│   └── seed.js              # Datos de prueba
├── src/
│   ├── config/
│   │   ├── prisma.js        # Cliente Prisma (Singleton)
│   │   ├── cloudinary.js    # Configuración de Cloudinary
│   │   ├── jwt.js           # Configuración de JWT
│   │   └── sse.js           # Mapa de conexiones SSE
│   ├── controllers/         # Reciben req/res, delegan al service
│   ├── middlewares/
│   │   ├── auth.middleware.js      # Verificación de JWT
│   │   ├── validate.middleware.js  # Validación con Zod
│   │   └── error.middleware.js     # Manejo centralizado de errores
│   ├── routes/                     # Definición de rutas y sus middlewares
│   ├── schemas/                    # Schemas de validación Zod
│   └── services/                   # Lógica de negocio y acceso a Prisma
├── app.js                          # Configuración de Express (middlewares, rutas)
├── server.js                       # Punto de entrada (listen + graceful shutdown)
└── package.json
```

### Manejo de errores

Se usa una jerarquía de clases de error:

```javascript
AppError               → base (statusCode, isOperational)
├── NotFoundError      → 404
├── UnauthorizedError  → 401
├── ForbiddenError     → 403
├── ValidationError    → 400 (con campo `details`)
└── ConflictError      → 409
```

El middleware `errorHandler` captura todos los errores con `next(err)` y los formatea de forma consistente. Los errores de Prisma (como violaciones de unique) también se interceptan y traducen a respuestas HTTP legibles.

---

### Modelo de datos

#### Diagrama de entidades

```
User ────────────────────────────────────┐
  │                                      │
  │ 1:N (author)     N:N (follows)       │
  ▼                                      │
Recipe ◄─────────────────────────────────┘
  │
  ├── 1:N ──► RecipeIngredient ──► Ingredient ◄── FridgeItem ──► User
  ├── 1:N ──► RecipeStep
  ├── 1:N ──► Comment ─────────────► User
  ├── 1:N ──► Rating ──────────────► User
  ├── 1:N ──► SavedRecipe ─────────► User
  ├── 1:N ──► Notification
  └── N:1 ──► Meal (category: BREAKFAST | LUNCH | DINNER | ...)
```

---

### API Endpoints

**Base URL:** `http://localhost:3000/api/v1`

**Autenticación:** `Authorization: Bearer <token>` en el header.

Las rutas marcadas con 🔒 requieren token. Las marcadas con 👤 funcionan con o sin token (la respuesta se enriquece si hay token)

---

### Auth

| Método | Ruta             | Auth | Descripción                            |
| ------ | ---------------- | ---- | -------------------------------------- |
| POST   | `/auth/register` | —    | Crear cuenta nueva                     |
| POST   | `/auth/login`    | —    | Iniciar sesión                         |
| GET    | `/auth/me`       | 🔒   | Obtener perfil del usuario autenticado |

#### POST `/auth/register`

```json
// Body
{
  "email": "elena@ejemplo.com",
  "username": "elena_cocina",       // 3-20 chars, solo letras/números/guión bajo
  "displayName": "Elena Martínez",  // 2-50 chars
  "password": "Password123"         // min 8 chars, 1 mayúscula, 1 número
}

// Response 201
{
  "user": { "id", "email", "username", "displayName", "avatarUrl", "createdAt" },
  "token": "eyJhbGc..."
}
```

#### POST `/auth/login`

```json
// Body
{ "email": "elena@ejemplo.com", "password": "Password123" }

// Response 200
{ "user": { ... }, "token": "eyJhbGc..." }
```

---

### Recipes

| Método | Ruta                    | Auth | Descripción                               |
| ------ | ----------------------- | ---- | ----------------------------------------- |
| GET    | `/recipes`              | 👤   | Listar recetas con filtros y paginación   |
| POST   | `/recipes`              | 🔒   | Crear receta                              |
| GET    | `/recipes/fridge-match` | 🔒   | Recetas que puedo cocinar con mi heladera |
| GET    | `/recipes/:id`          | 👤   | Detalle de una receta                     |
| PATCH  | `/recipes/:id`          | 🔒   | Editar receta (solo el autor)             |
| DELETE | `/recipes/:id`          | 🔒   | Eliminar receta (solo el autor)           |
| POST   | `/recipes/:id/save`     | 🔒   | Guardar en favoritos                      |
| DELETE | `/recipes/:id/save`     | 🔒   | Quitar de favoritos                       |
| POST   | `/recipes/:id/rate`     | 🔒   | Puntuar receta (1-5)                      |

#### GET `/recipes` — Query params

| Param        | Tipo   | Default | Descripción                                                            |
| ------------ | ------ | ------- | ---------------------------------------------------------------------- |
| `page`       | number | 1       | Página actual                                                          |
| `limit`      | number | 12      | Items por página (máx 50)                                              |
| `search`     | string | —       | Buscar en título, descripción y tags                                   |
| `category`   | enum   | —       | BREAKFAST \| LUNCH \| DINNER \| SNACK \| DESSERT \| DRINK \| APPETIZER |
| `difficulty` | enum   | —       | EASY \| MEDIUM \| HARD                                                 |
| `sortBy`     | enum   | recent  | recent \| popular \| rating                                            |
| `authorId`   | string | —       | Filtrar por autor                                                      |
| `tags`       | string | —       | Tags separados por coma: `"vegano,rapido"`                             |

```json
// Response 200
{
  "data": [ ...recetas ],
  "pagination": {
    "total": 48,
    "page": 1,
    "limit": 12,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### POST `/recipes`

```json
// Body
{
  "title": "Pizza Clásica",
  "description": "La pizza más clásica de Italia...",
  "mealId": "cuid_de_la_comida",
  "difficulty": "MEDIUM",
  "prepTimeMinutes": 30,
  "cookTimeMinutes": 15,
  "servings": 4,
  "isPublic": true,
  "imageUrl": "https://res.cloudinary.com/...",
  "tags": ["italiana", "vegetariana"],
  "ingredients": [
    {
      "ingredientId": "cuid_ingrediente",
      "quantity": 500,
      "unit": "GRAM",
      "notes": "tamiz antes de usar",
      "order": 1
    }
  ],
  "steps": [
    {
      "order": 1,
      "title": "Preparar la masa",
      "description": "Mezclar harina con agua tibia...",
      "durationMin": 15
    }
  ]
}
```

---

### Comments

| Método | Ruta                               | Auth | Descripción                      |
| ------ | ---------------------------------- | ---- | -------------------------------- |
| GET    | `/recipes/:id/comments`            | 👤   | Listar comentarios de una receta |
| POST   | `/recipes/:id/comments`            | 🔒   | Agregar comentario               |
| DELETE | `/recipes/:id/comments/:commentId` | 🔒   | Eliminar comentario propio       |

```json
// POST body
{ "content": "Excelente receta, la hice el fin de semana." }
```

---

### Meals

| Método | Ruta     | Auth | Descripción              |
| ------ | -------- | ---- | ------------------------ |
| GET    | `/meals` | —    | Listar todas las comidas |
| POST   | `/meals` | 🔒   | Crear nueva comida       |

```json
// POST body
{ "name": "Pizza", "category": "DINNER" }
```

---

### Fridge (Heladera)

| Método | Ruta                            | Auth | Descripción                            |
| ------ | ------------------------------- | ---- | -------------------------------------- |
| GET    | `/fridge`                       | 🔒   | Listar items de mi heladera            |
| POST   | `/fridge`                       | 🔒   | Agregar item                           |
| PATCH  | `/fridge/:itemId`               | 🔒   | Actualizar cantidad/unidad/vencimiento |
| DELETE | `/fridge/:itemId`               | 🔒   | Eliminar item                          |
| GET    | `/fridge/ingredients/search?q=` | 🔒   | Buscar ingredientes del catálogo       |
| POST   | `/fridge/ingredients`           | 🔒   | Crear nuevo ingrediente en el catálogo |

```json
// POST /fridge body
{
  "ingredientId": "cuid_ingrediente",
  "quantity": 500,
  "unit": "GRAM",
  "expiresAt": "2025-06-15T00:00:00.000Z" // opcional
}
```

---

### Users

| Método | Ruta                         | Auth | Descripción                  |
| ------ | ---------------------------- | ---- | ---------------------------- |
| GET    | `/users/:username`           | 👤   | Perfil público de un usuario |
| GET    | `/users/:username/recipes`   | 👤   | Recetas de un usuario        |
| PATCH  | `/users/me`                  | 🔒   | Actualizar perfil propio     |
| POST   | `/users/:username/follow`    | 🔒   | Seguir a un usuario          |
| DELETE | `/users/:username/follow`    | 🔒   | Dejar de seguir              |
| GET    | `/users/:username/follow`    | 🔒   | Estado de seguimiento        |
| GET    | `/users/:username/followers` | —    | Lista de seguidores          |
| GET    | `/users/:username/following` | —    | Lista de seguidos            |
| GET    | `/users/feed`                | 🔒   | Recetas de usuarios seguidos |

```json
// PATCH /users/me body
{
  "displayName": "Elena M.", // opcional
  "bio": "Cocinera amateur", // opcional
  "avatarUrl": "https://..." // opcional
}
```

---

### Recommendations

| Método | Ruta                           | Auth | Descripción                                     |
| ------ | ------------------------------ | ---- | ----------------------------------------------- |
| GET    | `/recommendations/feed`        | 🔒   | Feed personalizado con scoring                  |
| GET    | `/recommendations/fridge`      | 🔒   | Match con heladera (con ingredientes faltantes) |
| GET    | `/recommendations/similar/:id` | 👤   | Recetas similares a una dada                    |
| GET    | `/recommendations/trending`    | 👤   | Trending por actividad reciente                 |

#### GET `/recommendations/feed` — Query params

| Param   | Default | Descripción               |
| ------- | ------- | ------------------------- |
| `limit` | 12      | Items a devolver (máx 30) |

```json
// Response, incluye _score y _scores por componente
{
  "data": [
    {
      ...recipe,
      "_score": 0.73,
      "_scores": {
        "ingredientMatch": 0.8,
        "tasteMatch": 0.6,
        "socialScore": 0.4,
        "freshnessScore": 1.0,
        "popularityScore": 0.2
      }
    }
  ],
  "meta": {
    "basedOn": {
      "fridgeItems": 8,
      "ratings": 12,
      "savedRecipes": 5,
      "following": 3
    }
  }
}
```

#### GET `/recommendations/fridge`

```json
// Response, incluye % de match e ingredientes faltantes
{
  "data": [
    {
      ...recipe,
      "matchPercentage": 75,
      "matchCount": 3,
      "totalIngredients": 4,
      "missingIngredients": ["Parmesano"],
      "usesExpiring": true
    }
  ],
  "meta": {
    "fridgeIngredients": 8,
    "expiringIngredients": 2
  }
}
```

---

### Upload (Imágenes)

| Método | Ruta                      | Auth | Descripción                                    |
| ------ | ------------------------- | ---- | ---------------------------------------------- |
| GET    | `/upload/signature?type=` | 🔒   | Obtener firma para upload directo a Cloudinary |
| POST   | `/upload/confirm`         | 🔒   | Confirmar upload completado                    |

**Tipos de upload:** `recipe` (máx 10MB, 1200×800) \| `step` (máx 5MB, 800×600) \| `avatar` (máx 5MB, 400×400 face-crop)

---

### Notifications

| Método | Ruta                          | Auth | Descripción                                 |
| ------ | ----------------------------- | ---- | ------------------------------------------- |
| GET    | `/notifications/stream`       | 🔒\* | Stream SSE de notificaciones en tiempo real |
| GET    | `/notifications`              | 🔒   | Listar notificaciones (paginado)            |
| GET    | `/notifications/unread-count` | 🔒   | Cantidad de no leídas                       |
| PATCH  | `/notifications/read`         | 🔒   | Marcar como leídas                          |
| DELETE | `/notifications/:id`          | 🔒   | Eliminar notificación                       |

> \*El stream SSE no soporta headers customizados en el navegador, por lo que el token se pasa como query param: `?token=...`

#### GET `/notifications/stream`

Conexión persistente Server-Sent Events. El cliente recibe eventos en tiempo real:

```
event: connected
data: {"unreadCount": 3}

event: notification
data: {"id":"...","type":"COMMENT","message":"Elena comentó tu receta...","read":false,...}

: heartbeat
```

#### PATCH `/notifications/read`

```json
// Marcar específicas
{ "ids": ["id1", "id2"] }

// Marcar todas (body vacío)
{}
```

### Formato de error estándar

Todos los errores tienen el mismo formato:

```json
// Error simple
{ "error": "Mensaje de error" }

// Error de validación (400)
{
  "error": "Datos inválidos",
  "details": [
    { "field": "email", "message": "Email inválido" },
    { "field": "password", "message": "Mínimo 8 caracteres" }
  ]
}
```

### Códigos de respuesta

| Código | Significado                           |
| ------ | ------------------------------------- |
| 200    | OK                                    |
| 201    | Creado                                |
| 204    | Sin contenido (DELETE exitoso)        |
| 400    | Datos inválidos (validación)          |
| 401    | No autenticado (falta token o expiró) |
| 403    | Sin permiso (ej: editar receta ajena) |
| 404    | Recurso no encontrado                 |
| 409    | Conflicto (ej: email ya registrado)   |
| 500    | Error interno del servidor            |
| 503    | Servicio no disponible (ej: DB caída) |

---

## Arquitectura del frontend

### Estructura de carpetas

```
frontend/src/
├── components/
│   ├── layout/        # Header, BottomNav, MainLayout
│   └── ui/            # Componentes reutilizables (RecipeCard, ImageUploader, etc.)
├── contexts/
│   ├── AuthContext.jsx      # Estado global de autenticación
│   └── ThemeContext.jsx     # Dark/light mode
├── hooks/
│   ├── useAuth.js           # Acceso al AuthContext
│   ├── useTheme.js          # Acceso al ThemeContext
│   ├── useApi.js            # useQuery y useMutation genéricos
│   ├── useDebounce.js       # Delay para búsquedas
│   ├── useRecipeForm.js     # Lógica del formulario multi-step
│   ├── useRecipeSearch.js   # Filtros y paginación del Home
│   ├── useImageUpload.js    # Upload firmado a Cloudinary
│   └── useNotifications.js  # SSE + estado de notificaciones
├── pages/
│   ├── Home/            # Feed principal con búsqueda y filtros
│   ├── Auth/            # Login y Register
│   ├── Recipe/          # Detalle y creación de recetas
│   ├── Profile/         # Perfil de usuario
│   ├── Fridge/          # Gestión de heladera
│   └── Recommendations/ # Página de recomendaciones
├── services/            # Llamadas a la API (una función por endpoint)
└── styles/
    ├── tokens.css       # Variables CSS del design system
    └── global.css       # Reset y estilos base
```

### Gestión del estado

El estado se maneja en tres niveles:

```
Global (Context)
├── AuthContext    → usuario autenticado, token
└── ThemeContext   → dark/light mode

Local (hooks)
├── useRecipeSearch → filtros, resultados, paginación
├── useRecipeForm   → estado del formulario multi-step
└── useNotifications → notificaciones, unreadCount

Servidor (useQuery/useMutation)
└── Datos de la API (sin cache, cada mount hace fetch)
```

### Flujo de autenticación en el cliente

```
Arranca App
  │
  ├─ ¿Hay token en localStorage?
  │     │
  │     ├─ SÍ → GET /auth/me con el token
  │     │         ├─ OK   → setUser(data), loading=false
  │     │         └─ 401  → removeToken(), loading=false
  │     │
  │     └─ NO → loading=false
  │
  ├─ Mientras loading=true → mostrar spinner global
  └─ Después → renderizar rutas (PrivateRoute redirige si !user)
```

---

## Sistema de recomendaciones

El sistema calcula un **score compuesto** para cada receta candidata combinando cinco parámetros con valores (pesos) configurables:

```javascript
SCORE =
  ingredientMatch  × 0.40   // % de ingredientes de la receta en la heladera
+ tasteMatch       × 0.25   // alineación con categorías y tags favoritos del usuario
+ socialScore      × 0.20   // popularidad entre usuarios que sigo
+ freshnessScore   × 0.10   // qué tan reciente es la receta
+ popularityScore  × 0.05   // guardados y ratings globales
```

| Parámetro        | Fuente                       | Peso |
| ---------------- | ---------------------------- | ---- |
| Ingredient match | FridgeItem del usuario       | 40%  |
| Taste match      | Ratings ≥ 4★ + SavedRecipes  | 25%  |
| Social score     | SavedBy de usuarios que sigo | 20%  |
| Freshness        | createdAt de la receta       | 10%  |
| Popularity       | \_count savedBy + ratings    | 5%   |

### Fridge match especial

El endpoint `/recommendations/fridge` usa una lógica más directa optimizada para UX:

- Filtra recetas que comparten al menos 1 ingrediente con la heladera
- Calcula el % de cobertura (3 de 4 ingredientes = 75%)
- Aplica un bonus de +20 puntos si la receta usa ingredientes próximos a vencer
- Devuelve la lista de ingredientes faltantes para que el usuario sepa qué comprar

### Perfil de gustos

Se construye a partir de:

- Recetas con rating ≥ 4★ (peso doble)
- Recetas guardadas (peso simple)

Se extraen las categorías y tags más frecuentes para construir un mapa de preferencias normalizado.

---

## Notificaciones en tiempo real con Server-Sent Events (SSE)

```javascript
// Mapa de conexiones activas
connections: Map<userId, Set<Response>>

// Un usuario puede tener múltiples pestañas abiertas
// Cada pestaña tiene su propia conexión SSE
// Al emitir, envia a todas las conexiones del usuario
```

### Tipos de notificación y cuándo se generan

| Tipo    | Cuándo                 | Destinatario       |
| ------- | ---------------------- | ------------------ |
| COMMENT | Al comentar una receta | Autor de la receta |
| FOLLOW  | Al seguir a alguien    | El usuario seguido |
| SAVE    | Al guardar una receta  | Autor de la receta |
| RATING  | Al puntuar una receta  | Autor de la receta |
| SYSTEM  | Al registrarse         | El nuevo usuario   |

#### Fire-and-forget

Las notificaciones se envían de forma asíncrona sin bloquear la respuesta principal:

```javascript
// La acción (comentar) responde inmediatamente
// La notificación falla silenciosamente si hay error
notificationService.notifyComment(...).catch(console.error)
```

Un error en el sistema de notificaciones nunca rompe la funcionalidad principal.

**Heartbeat**: Cada conexión SSE envía un comentario vacío cada 30 segundos para evitar que proxies y load balancers cierren la conexión por inactividad.

---
