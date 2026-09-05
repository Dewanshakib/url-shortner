# URL Shortener

A URL shortening service built with [NestJS](https://nestjs.com), [Prisma](https://www.prisma.io), and PostgreSQL. Features JWT-based authentication, short URL generation with click tracking, paginated URL listing, in-memory caching, and per-route rate limiting.

## Tech Stack

- **Runtime:** Node.js + TypeScript (ESM)
- **Framework:** NestJS 11
- **ORM:** Prisma 7 (with `@prisma/adapter-pg`)
- **Database:** PostgreSQL
- **Auth:** JWT (`@nestjs/jwt`) + bcrypt password hashing
- **Validation:** `class-validator` + `class-transformer` (global `ValidationPipe` with whitelist)
- **Caching:** `@nestjs/cache-manager` + `cache-manager` (in-memory store, TTL via `CACHE_TTL`)
- **Rate Limiting:** `@nestjs/throttler` v6 (global `ThrottlerGuard` with named buckets)
- **Config:** `@nestjs/config` (global, `.env` file)
- **Docs:** `@nestjs/swagger` (Swagger UI at `/docs`)
- **Package Manager:** pnpm

## Features

- User registration and login with JWT access tokens
- Global JWT auth guard with `@Public()` decorator for open routes
- Short URL generation using 8-character unique IDs (`short-unique-id`)
- Automatic redirect (HTTP 302) with click count tracking
- Paginated listing of a user's short URLs (5 per page)
- Cache-aside caching for redirects and URL listings
- Per-endpoint rate limiting via named throttler buckets
- Global response interceptor (`{ success, statusCode, message, data }`), exception filter, and `/api/v1` prefix
- Swagger API documentation with persisted Bearer auth

## Project Setup

```bash
# install dependencies
$ pnpm install

# copy and configure environment variables
$ cp .example.env .env

# run database migrations
$ npx prisma migrate deploy

# generate prisma client
$ npx prisma generate
```

> Note: `.example.env` currently only contains `DATABASE_URL`, `BASE_URL`, `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`. Copy the `CACHE_*` and `*_TTL` / `*_LIMIT` variables documented below into your `.env` manually.

## Environment Variables

| Variable         | Description                                    | Example                                    |
| ---------------- | ---------------------------------------------- | ------------------------------------------ |
| `DATABASE_URL`   | PostgreSQL connection string                   | `postgresql://user:pass@localhost:5432/db` |
| `BASE_URL`       | Base URL used to build short links             | `http://localhost:8000/`                   |
| `PORT`           | Server port                                    | `8000`                                     |
| `JWT_SECRET`     | Secret key for signing JWTs                    | `your-super-secret-key`                    |
| `JWT_EXPIRES_IN` | JWT access token expiry                        | `7d`                                       |
| `CACHE_TTL`      | Default cache TTL for `CacheModule`            | `900`                                      |

Rate limiting is configured in `src/app.module.ts` via `ThrottlerModule.forRootAsync()` reading these env vars (all `TTL` values are in milliseconds):

| Variable         | Bucket     | Description                        | Example   |
| ---------------- | ---------- | ---------------------------------- | --------- |
| `AUTH_TTL`       | `AUTH`     | Window for register/login          | `900000`  |
| `AUTH_LIMIT`     | `AUTH`     | Max requests per window            | `15`      |
| `PROFILE_TTL`    | `PROFILE`  | Window for `GET /auth/profile`     | `3600000` |
| `PROFILE_LIMIT`  | `PROFILE`  | Max requests per window            | `60`      |
| `LOGOUT_TTL`     | `LOGOUT`   | Window for `POST /auth/logout`     | `600000`  |
| `LOGOUT_LIMIT`   | `LOGOUT`   | Max requests per window            | `10`      |
| `CREATE_TTL`     | `CREATE`   | Window for `POST /urls/short-url`  | `1800000` |
| `CREATE_LIMIT`   | `CREATE`   | Max requests per window            | `30`      |
| `LIST_TTL`       | `LIST`     | Window for `GET /urls/:userId`     | `3600000` |
| `LIST_LIMIT`     | `LIST`     | Max requests per window            | `60`      |
| `REDIRECT_TTL`   | `REDIRECT` | Window for `GET /:shortId`         | `60000`   |
| `REDIRECT_LIMIT` | `REDIRECT` | Max requests per window            | `300`     |

Current defaults in `.env`:

- `AUTH`: 15 req / 15 min
- `PROFILE`: 60 req / 1 h
- `LOGOUT`: 10 req / 10 min
- `CREATE`: 30 req / 30 min
- `LIST`: 60 req / 1 h
- `REDIRECT`: 300 req / 1 min

## Caching

Caching is wired in `src/modules/urls/urls.module.ts` with `CacheModule.registerAsync()` (`ttl: CACHE_TTL`, default in-memory store — no Redis) and consumed in `src/modules/urls/urls.service.ts` via `CACHE_MANAGER`.

Strategy is cache-aside:

- **Redirect — `GET /:shortId`:**
  - Key: `url:{shortId}`
  - Hit: returns cached `{ statusCode: 302, url }`, still increments `click_count` in DB.
  - Miss: `findUnique({ where: { short_id } })` → 404 `Invalid url` if missing → increments `click_count` → caches `{ statusCode: 302, url: redirect_url }` → returns it.
- **List by user — `GET /urls/:userId?page=N`:**
  - Key: `uid:{userId}` (note: page number is not part of the key; paginated DB query is `skip: (page-1)*5, take: 5`)
  - Hit: returns cached array.
  - Miss: `findMany({ where: { user_id }, skip, take })` → caches result under `uid:{userId}` → returns it.

Notes / limitations:

- `POST /urls/short-url` does not populate or invalidate `uid:{userId}`, so a newly created URL may not appear in a cached list until `CACHE_TTL` expires.
- Click-count increments always hit the DB, even on cache hits, so counts stay accurate while redirects stay fast.

## Rate Limiting

Rate limiting is enforced globally by `ThrottlerGuard` (`APP_GUARD` in `src/app.module.ts`) with 6 named buckets (`AUTH`, `PROFILE`, `LOGOUT`, `CREATE`, `LIST`, `REDIRECT`).

Each controller applies its bucket with `@Throttle({ BUCKET: {} })`, which picks up the `ttl`/`limit` defined for that name in `AppModule`:

- `src/modules/auth/auth.controller.ts`: `register` → `AUTH`, `login` → `AUTH`, `profile` → `PROFILE`, `logout` → `LOGOUT`
- `src/modules/urls/urls.controller.ts`: `POST urls/short-url` → `CREATE`, `GET :shortId` → `REDIRECT`, `GET /urls/:userId` → `LIST`

When a bucket is exhausted Nest returns `429 Too Many Requests` (formatted by the global `HttpExceptionFilter` as `{ success: false, statusCode: 429, message }`).

## Compile and Run

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production build & run
$ pnpm run build
$ pnpm run start:prod
```

On boot (`src/main.ts`) the server logs the API and Swagger URLs, e.g.:

```
Base API URL : http://localhost:8000/api/v1
Swagger Docs : http://localhost:8000/docs
```

## API Endpoints

All routes are prefixed with `/api/v1` except the redirect route (excluded via `setGlobalPrefix` in `src/main.ts`).

| Method | Endpoint                 | Auth     | Rate Limit | Description                                  |
| ------ | ------------------------ | -------- | ---------- | -------------------------------------------- |
| POST   | `/auth/register`         | Public   | `AUTH` (15 / 15min)     | Register a new user (`name`, `email`, `password`) |
| POST   | `/auth/login`            | Public   | `AUTH` (15 / 15min)     | Login and receive a JWT access token         |
| GET    | `/auth/profile`          | Required | `PROFILE` (60 / 1h)     | Get the current user's profile from the JWT  |
| POST   | `/auth/logout`           | Required | `LOGOUT` (10 / 10min)   | Deactivate the current user (`is_active=false`) |
| POST   | `/urls/short-url`        | Required | `CREATE` (30 / 30min)   | Create a short URL (`url` in body)           |
| GET    | `/urls/:userId?page=N`   | Required | `LIST` (60 / 1h)        | List a user's short URLs (paginated, 5/page, cached) |
| GET    | `/:shortId`              | Public   | `REDIRECT` (300 / 1min) | Redirect to the original URL (302, cached), increments click count |

Protected routes require the header:

```
Authorization: Bearer <access_token>
```

Swagger UI with Bearer (`access-token`) auth is served at `GET /docs`.

Response shape (all routes except `GET /:shortId`, which uses `@SkipResponse()` + `@Redirect()` for a raw 302):

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request successful",
  "data": {}
}
```

Errors are formatted by `HttpExceptionFilter` as:

```json
{
  "success": false,
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

## Database Schema

Two models defined in `prisma/schema.prisma`:

- **User** (`users`) — `id`, `name`, `email` (unique), `password`, `is_active`, timestamps
- **ShortUrl** (`short_urls`) — `id`, `short_id` (unique, indexed, 8 chars), `redirect_url`, `click_count`, `user_id` (FK to User, cascade delete)

## Run Tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Project Structure

```
src/
├── main.ts                          # Bootstrap: global prefix, pipes, Swagger (/docs), filters
├── app.module.ts                    # ConfigModule, ThrottlerModule (6 buckets), PrismaModule, CoreModule, global ThrottlerGuard + ResponseInterceptor
├── common/
│   ├── decorator/                   # @Public(), @SkipResponse()
│   ├── filters/                     # HttpExceptionFilter -> { success: false, statusCode, message }
│   ├── guards/                      # Global JWT AuthGuard
│   └── interceptors/                # ResponseInterceptor (skipped for redirect)
├── database/                        # Prisma module & service
└── modules/
    ├── core.module.ts               # Feature modules aggregator (Urls, Auth, User)
    ├── auth/                        # Register, login, logout, profile (+ @Throttle AUTH/PROFILE/LOGOUT)
    ├── urls/                        # Short URL generation, redirect + list (CacheModule, @Throttle CREATE/LIST/REDIRECT)
    └── user/                        # User lookup service
```
