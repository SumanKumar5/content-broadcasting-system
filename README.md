<div align="center">

# Content Broadcasting System

### A robust backend system for distributing educational content from teachers to students via a real-time broadcasting API.

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.x-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Cloud_Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)
[![Swagger](https://img.shields.io/badge/Swagger-API_Docs-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Scheduling Logic](#-scheduling-logic)
- [Content Lifecycle](#-content-lifecycle)
- [Project Structure](#-project-structure)
- [Assumptions](#-assumptions)

---

## Overview

The **Content Broadcasting System** is a production-ready REST API backend built for modern educational environments. Teachers upload subject-based content (images), the Principal approves it, and students access live content through a public broadcasting endpoint — no physical copies needed.

The system features JWT-based authentication, strict role-based access control, a Cloudinary-powered file upload pipeline, an approval workflow, a time-deterministic subject-based scheduling engine, Redis caching, rate limiting, subject-wise analytics, and full Swagger API documentation.

---

## Features

### Core

- **JWT Authentication** with role-based access control (Principal / Teacher)
- **Content Upload System** with file type and size validation
- **Cloudinary Storage** for cloud-based image hosting
- **Approval Workflow** - Principal approves or rejects with a reason
- **Public Broadcasting API** - students access live content without authentication
- **Subject-based Scheduling** - independent rotation per subject per teacher
- ⏱ **Time-deterministic Rotation** - no background jobs required
- **Edge Case Handling** - no content, outside window, invalid teacher
- **Clean Architecture** - controllers, services, middlewares, validations fully separated

### Bonus

- **Redis Caching** - `/content/live` responses cached with 30s TTL
- **Rate Limiting** - public API and auth endpoints protected
- **Subject-wise Analytics** - most active subject, content usage tracking
- **Pagination & Filters** - filter by subject, teacher, status with page/limit
- **Swagger UI** - full interactive API documentation at `/api-docs`

---

## Tech Stack

| Layer            | Technology                         |
| ---------------- | ---------------------------------- |
| Runtime          | Node.js 22.x                       |
| Language         | TypeScript 5.x                     |
| Framework        | Express.js 4.x                     |
| Database         | PostgreSQL 18.x                    |
| ORM              | Prisma 7.x                         |
| Cache            | Redis 7.x (via ioredis)            |
| File Storage     | Cloudinary                         |
| Authentication   | JSON Web Tokens (JWT)              |
| Password Hashing | bcrypt                             |
| File Uploads     | Multer + multer-storage-cloudinary |
| Validation       | Zod                                |
| API Docs         | Swagger UI (swagger-jsdoc)         |
| Rate Limiting    | express-rate-limit                 |
| Environment      | dotenv                             |

---

## System Architecture

```
Client (Teacher / Principal)
        │
        ▼
   Express Server
        │
   ┌────┴────┐
   │  Routes │  ← authenticate + authorize + rateLimiter middlewares
   └────┬────┘
        │
   ┌────┴─────────┐
   │  Controllers │  ← parse input, call services, send response
   └────┬─────────┘
        │
   ┌────┴──────────┐
   │   Services    │  ← business logic, scheduling algorithm
   └────┬──────────┘
        │
   ┌────┴──────────┐
   │  Prisma ORM   │  ← type-safe database queries
   └────┬──────────┘
        │
   PostgreSQL DB


Public Client (Student)
        │
        ▼
GET /api/content/live/:teacherId
        │
        ▼
   Redis Cache ──── HIT ──▶ Return cached response
        │
       MISS
        │
        ▼
  Scheduling Engine
  (time-deterministic rotation)
        │
        ▼
  Cache result in Redis (30s TTL)
        │
        ▼
  Active Content Response
```

---

## Database Schema

```
Users
─────────────────────────────
id            UUID (PK)
name          String
email         String (unique)
passwordHash  String
role          principal | teacher
createdAt     DateTime

Content
─────────────────────────────
id              UUID (PK)
title           String
description     String?
subject         String
fileUrl         String
fileType        String
fileSize        Int
status          pending | approved | rejected
rejectionReason String?
startTime       DateTime?
endTime         DateTime?
uploadedBy      UUID (FK → Users)
approvedBy      UUID? (FK → Users)
approvedAt      DateTime?
createdAt       DateTime

ContentSlot
─────────────────────────────
id          UUID (PK)
subject     String
teacherId   UUID (FK → Users)
createdAt   DateTime
[UNIQUE: subject + teacherId]

ContentSchedule
─────────────────────────────
id             UUID (PK)
contentId      UUID (FK → Content)
slotId         UUID (FK → ContentSlot)
rotationOrder  Int
duration       Int (minutes)
createdAt      DateTime
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+
- [Redis](https://redis.io/) v7+ (or Docker)
- [Git](https://git-scm.com/)
- [Cloudinary Account](https://cloudinary.com/) (free)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/SumanKumar5/content-broadcasting-system.git
   cd content-broadcasting-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your values (see [Environment Variables](#-environment-variables))

4. **Start Redis** (via Docker)

   ```bash
   docker run -d --name redis-cbs -p 6379:6379 redis:alpine
   ```

5. **Create the PostgreSQL database**

   ```bash
   psql -U postgres -c "CREATE DATABASE content_broadcasting;"
   ```

6. **Run database migrations**

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

7. **Start the development server**

   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:3000`

8. **View API documentation**
   ```
   http://localhost:3000/api-docs
   ```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/content_broadcasting
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
NODE_ENV=development
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

| Variable                | Description                     | Default                  |
| ----------------------- | ------------------------------- | ------------------------ |
| `PORT`                  | Server port                     | `3000`                   |
| `DATABASE_URL`          | PostgreSQL connection string    | -                        |
| `JWT_SECRET`            | Secret key for signing JWTs     | -                        |
| `JWT_EXPIRES_IN`        | JWT expiry duration             | `7d`                     |
| `MAX_FILE_SIZE`         | Max upload size in bytes        | `10485760` (10MB)        |
| `UPLOAD_DIR`            | Local upload directory fallback | `uploads`                |
| `NODE_ENV`              | Environment                     | `development`            |
| `REDIS_URL`             | Redis connection URL            | `redis://localhost:6379` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name           | -                        |
| `CLOUDINARY_API_KEY`    | Cloudinary API key              | -                        |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret           | -                        |

---

## API Reference

### Base URL

```
http://localhost:3000/api
```

> Full interactive documentation available at [`/api-docs`](http://localhost:3000/api-docs)

---

### Auth

| Method | Endpoint         | Description                         |
| ------ | ---------------- | ----------------------------------- |
| POST   | `/auth/register` | Register a new principal or teacher |
| POST   | `/auth/login`    | Login and receive a JWT token       |

#### Register

```http
POST /auth/register
Content-Type: application/json
```

```json
{
  "name": "Teacher One",
  "email": "teacher@school.com",
  "password": "password123",
  "role": "teacher"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "teacher@school.com",
  "password": "password123"
}
```

---

### Content - Teacher

| Method | Endpoint              | Description                                 |
| ------ | --------------------- | ------------------------------------------- |
| POST   | `/content/upload`     | Upload content with file                    |
| GET    | `/content/my-content` | Get own content with filters and pagination |

#### Upload Content

```http
POST /content/upload
Authorization: Bearer <teacher_token>
Content-Type: multipart/form-data
```

| Field       | Type | Required | Description                 |
| ----------- | ---- | -------- | --------------------------- |
| title       | Text | ✅       | Content title               |
| subject     | Text | ✅       | Subject name (e.g. maths)   |
| file        | File | ✅       | JPG, PNG, or GIF (max 10MB) |
| description | Text | ❌       | Optional description        |
| startTime   | Text | ❌       | ISO 8601 datetime           |
| endTime     | Text | ❌       | ISO 8601 datetime           |
| duration    | Text | ❌       | Minutes per rotation slot   |

#### Get My Content (with filters)

```http
GET /content/my-content?subject=maths&status=approved&page=1&limit=10
Authorization: Bearer <teacher_token>
```

---

### Content - Principal

| Method | Endpoint               | Description                                 |
| ------ | ---------------------- | ------------------------------------------- |
| GET    | `/content/all`         | Get all content with filters and pagination |
| GET    | `/content/pending`     | Get pending content with pagination         |
| PATCH  | `/content/:id/approve` | Approve content                             |
| PATCH  | `/content/:id/reject`  | Reject content with reason                  |

#### Get All Content (with filters)

```http
GET /content/all?subject=maths&teacherId=<id>&status=pending&page=1&limit=10
Authorization: Bearer <principal_token>
```

#### Reject Content

```http
PATCH /content/:id/reject
Authorization: Bearer <principal_token>
Content-Type: application/json
```

```json
{
  "rejectionReason": "Content is not appropriate for students"
}
```

---

### Public Broadcasting

| Method | Endpoint                   | Auth | Description                  |
| ------ | -------------------------- | ---- | ---------------------------- |
| GET    | `/content/live/:teacherId` | None | Get currently active content |

#### Get Live Content

```http
GET /content/live/:teacherId?subject=maths
```

**Response (content available):**

```json
{
  "success": true,
  "message": "Live content fetched successfully",
  "data": {
    "maths": {
      "id": "...",
      "title": "Algebra Basics",
      "subject": "maths",
      "fileUrl": "https://res.cloudinary.com/...",
      "fileType": "image/png",
      "startTime": "2026-04-27T00:00:00.000Z",
      "endTime": "2026-04-28T23:59:00.000Z",
      "rotationOrder": 1,
      "duration": 5
    }
  }
}
```

**Response (no content):**

```json
{
  "success": true,
  "message": "No content available",
  "data": null
}
```

---

### Analytics

| Method | Endpoint              | Auth      | Description                |
| ------ | --------------------- | --------- | -------------------------- |
| GET    | `/analytics/subjects` | Principal | Subject-wise analytics     |
| GET    | `/analytics/my-stats` | Teacher   | Teacher's own upload stats |

#### Subject Analytics

```http
GET /analytics/subjects
Authorization: Bearer <principal_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Analytics fetched successfully",
  "data": {
    "mostActiveSubject": "maths",
    "approvedContentBySubject": [{ "subject": "maths", "approvedCount": 5 }],
    "totalContentBySubject": [{ "subject": "maths", "totalCount": 7 }],
    "statusBreakdown": [
      { "subject": "maths", "status": "approved", "count": 5 },
      { "subject": "maths", "status": "rejected", "count": 2 }
    ],
    "scheduledContentBySubject": [{ "subject": "maths", "scheduledCount": 5 }]
  }
}
```

---

## Scheduling Logic

The scheduling engine uses a **time-deterministic rotation algorithm** — no cron jobs or background workers needed.

```
Given: approved content items for a subject, each with startTime, endTime, duration

Step 1: Filter items where now >= startTime AND now <= endTime
Step 2: Sort filtered items by rotationOrder
Step 3: Sum all durations → totalCycleDuration
Step 4: elapsedMinutes = floor((now - earliestStartTime) / 60000)
Step 5: positionInCycle = elapsedMinutes % totalCycleDuration
Step 6: Walk through items accumulating durations
        → return the item whose accumulated duration covers positionInCycle
```

**Example (Maths subject):**

```
Content A → 5 min  (order 1)
Content B → 5 min  (order 2)
Content C → 5 min  (order 3)
Total cycle = 15 min

At minute 0–4   → Content A is active
At minute 5–9   → Content B is active
At minute 10–14 → Content C is active
At minute 15    → loops back to Content A
```

**Redis Caching:**

- Every `/content/live` response is cached in Redis with a **30-second TTL**
- Cache key format: `live:<teacherId>:<subject|all>`
- Cache is bypassed gracefully if Redis is unavailable

---

## Content Lifecycle

```
Teacher uploads
      │
      ▼
  [ pending ]
      │
      ├──── Principal approves ──▶ [ approved ] ──▶ shown in /live if within time window
      │
      └──── Principal rejects ───▶ [ rejected ] ──▶ rejection reason stored
```

---

## Project Structure

```
content-broadcasting-system/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── content.controller.ts
│   │   ├── broadcasting.controller.ts
│   │   └── analytics.controller.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── content.routes.ts
│   │   ├── broadcasting.routes.ts
│   │   └── analytics.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── content.service.ts
│   │   ├── scheduling.service.ts
│   │   └── analytics.service.ts
│   ├── middlewares/
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   ├── rateLimiter.ts
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   ├── models/
│   │   └── prisma.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── response.ts
│   │   ├── fileUpload.ts
│   │   ├── cloudinaryUpload.ts
│   │   ├── redis.ts
│   │   └── swagger.ts
│   ├── validations/
│   │   ├── auth.validation.ts
│   │   └── content.validation.ts
│   └── app.ts
├── uploads/
├── architecture-notes.txt
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Assumptions

- Content without `startTime`, `endTime`, and `duration` will not appear in the live feed
- Subject names are normalized to lowercase on upload
- One active content item is returned per subject in the live feed
- The public `/live` endpoint returns an empty response (not an error) for invalid teacher IDs or missing content
- Files are stored on Cloudinary; the local `uploads/` directory serves as a fallback
- Redis caching fails silently - the system continues to work without Redis if unavailable
- Rate limiting: 100 requests per 15 minutes on public API, 20 requests per 15 minutes on auth endpoints

---
