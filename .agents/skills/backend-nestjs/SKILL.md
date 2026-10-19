---
name: backend-nestjs
description: >-
  Use this skill when designing, building, or modifying the NestJS backend API, database models, job queues, and business logic for RepuSense.
---

# NestJS Backend Architecture & API Guide

This skill governs the backend design for **RepuSense**, implemented with **NestJS** and **TypeScript**.

## Architecture & Module Layout

The backend follows modular Clean Architecture conventions:

```text
src/
├── app.module.ts
├── common/
│   ├── filters/           # Global exception filters (HttpExceptionFilter)
│   ├── interceptors/      # Response transformation & logging interceptors
│   └── dto/               # Shared pagination and generic query DTOs
└── modules/
    ├── leads/             # Lead management, filtering, and detail retrieval
    ├── scraping/          # Scraper orchestration, job triggers, and status
    ├── enrichment/        # LLM integration (review labeling & cold email drafts)
    ├── export/            # CSV / XLSX generation for sales export
    └── database/          # Prisma / TypeORM persistence layer & migrations
```

## Database Models & Relationships (Prisma / PostgreSQL)

### Key Entities
1. **Lead / Business**:
   - `id`: UUID (Primary Key)
   - `externalId`: String (Unique index; e.g. Google Place ID)
   - `name`: String
   - `category`: String
   - `city`: String
   - `rating`: Float
   - `reviewCount`: Int
   - `phone`: String?
   - `website`: String?
   - `source`: Enum (`GOOGLE_MAPS`, `YELP`, `TRIPADVISOR`)
   - `sourceUrl`: String
   - `status`: Enum (`NEW`, `CONTACTED`, `IN_CONVERSATION`, `DISQUALIFIED`, `CONVERTED`)
   - `createdAt`, `updatedAt`: Timestamps

2. **ContactDetail**:
   - `id`: UUID
   - `leadId`: UUID (Foreign Key -> Lead)
   - `email`: String?
   - `phone`: String?
   - `linkedinUrl`: String?
   - `instagramUrl`: String?
   - `source`: String (e.g., "website_crawl", "manual")

3. **Review**:
   - `id`: UUID
   - `leadId`: UUID (Foreign Key -> Lead)
   - `author`: String?
   - `rating`: Float
   - `text`: String
   - `reviewDate`: String?

4. **Enrichment**:
   - `id`: UUID
   - `leadId`: UUID (Unique Foreign Key -> Lead)
   - `primaryIssue`: String (e.g., "Atención al cliente deficiente")
   - `secondaryIssues`: String[]
   - `sentimentScore`: Float
   - `emailSubject`: String
   - `emailOpeningHook`: String
   - `emailBodyDraft`: String
   - `generatedAt`: Timestamp

5. **ScrapingJob**:
   - `id`: UUID
   - `city`: String
   - `industry`: String
   - `status`: Enum (`PENDING`, `RUNNING`, `COMPLETED`, `FAILED`)
   - `leadsFound`: Int
   - `leadsAdded`: Int
   - `errorMessage`: String?

## Deduplication & Upsert Strategy

To prevent duplicate leads when repeating queries:
- Use `externalId` (or hash of normalized `name + address + city`) as the unique constraint.
- Perform **upserts**:
  - If lead exists: update `rating`, `reviewCount`, and `updatedAt`. Preserve sales `status` and previous custom notes.
  - If lead is new: insert full record, trigger contact crawl, and queue for AI enrichment.

## API Endpoints (RESTful)

### Leads Management
- `GET /api/leads` - List leads with filters (`city`, `industry`, `minRating`, `maxRating`, `hasEmail`, `status`, `page`, `limit`).
- `GET /api/leads/:id` - Full lead profile including reviews, contacts, and AI insights.
- `PATCH /api/leads/:id/status` - Update outreach status (`CONTACTED`, etc.).

### Scraping Jobs
- `POST /api/scraping/jobs` - Trigger a scraping task with params (`city`, `industry`, `maxPages`).
- `GET /api/scraping/jobs` - List recent job runs and metrics.
- `GET /api/scraping/jobs/:id` - Status check and progress count.

### AI Enrichment
- `POST /api/leads/:id/enrich` - Trigger or re-run LLM categorization and email draft.

### Exports
- `GET /api/export/csv` - Generate and download CSV with applied filters.

## Validation & Conventions
- Use `class-validator` and `class-transformer` for all incoming DTOs.
- Use `ConfigService` for environment variables (`DATABASE_URL`, `GEMINI_API_KEY`, `PORT`).
- PostgreSQL 17 running via Docker (`repusense-postgres`), accessed via Prisma Client.
- Enable CORS for the React frontend URL.
