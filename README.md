# URL Shortener

A URL shortening service built with [NestJS](https://nestjs.com), [Prisma](https://www.prisma.io), and PostgreSQL. Features JWT-based authentication, short URL generation with click tracking, and paginated URL listing.

## Tech Stack

- **Runtime:** Node.js + TypeScript (ESM)
- **Framework:** NestJS 11
- **ORM:** Prisma 7 (with `@prisma/adapter-pg`)
- **Database:** PostgreSQL
- **Auth:** JWT (`@nestjs/jwt`) + bcrypt password hashing
- **Validation:** `class-validator` + `class-transformer` (global `ValidationPipe` with whitelist)
- **Package Manager:** pnpm

## Features

- User registration and login with JWT access tokens
- Global JWT auth guard with `@Public()` decorator for open routes
- Short URL generation using 8-character unique IDs (`short-unique-id`)
- Automatic redirect (HTTP 302) with click count tracking
- Paginated listing of a user's short URLs
- Global response interceptor, exception filter, and `/api/v1` prefix

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

## Environment Variables

See `.example.env`:

| Variable         | Description                                    | Example                                    |
| ---------------- | ---------------------------------------------- | ------------------------------------------ |
| `DATABASE_URL`   | PostgreSQL connection string                   | `postgresql://user:pass@localhost:5432/db` |
| `BASE_URL`       | Base URL used to build short links             | `http://localhost:5000/`                   |
| `PORT`           | Server port                                    | `5000`                                     |
| `JWT_SECRET`     | Secret key for signing JWTs                    | `your-super-secret-key`                    |
| `JWT_EXPIRES_IN` | JWT access token expiry                        | `15d`                                      |

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

## API Endpoints

All routes are prefixed with `/api/v1` except the redirect route.

| Method | Endpoint                 | Auth     | Description                                  |
| ------ | ------------------------ | -------- | -------------------------------------------- |
| POST   | `/auth/register`         | Public   | Register a new user (`name`, `email`, `password`) |
| POST   | `/auth/login`            | Public   | Login and receive a JWT access token         |
| GET    | `/auth/profile`          | Required | Get the current user's profile from the JWT  |
| POST   | `/auth/logout`           | Required | Deactivate the current user                  |
| POST   | `/urls/short-url`        | Required | Create a short URL (`url` in body)           |
| GET    | `/urls/:userId?page=N`   | Required | List a user's short URLs (paginated, 5/page) |
| GET    | `/:shortId`              | Public   | Redirect to the original URL (302), increments click count |

Protected routes require the header:

```
Authorization: Bearer <access_token>
```

## Database Schema

Two models defined in `prisma/schema.prisma`:

- **User** (`users`) — `id`, `name`, `email` (unique), `password`, `is_active`, timestamps
- **ShortUrl** (`short_urls`) — `id`, `short_id` (indexed), `redirect_url`, `click_count`, `user_id` (FK to User, cascade delete)

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
├── main.ts                          # Bootstrap: global prefix, pipes, filters
├── app.module.ts                    # Root module
├── common/
│   ├── decorator/                   # @Public(), @SkipResponse()
│   ├── filters/                     # HttpExceptionFilter
│   ├── guards/                      # Global JWT AuthGuard
│   └── interceptors/                # ResponseInterceptor
├── database/                        # Prisma module & service
└── modules/
    ├── core.module.ts               # Feature modules aggregator
    ├── auth/                        # Register, login, logout, profile
    ├── urls/                        # Short URL generation & redirect
    └── user/                        # User lookup service
```
