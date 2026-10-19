---
name: scraping-pipeline
description: >-
  Use this skill when developing, configuring, or debugging web scrapers and data extraction pipelines in Node.js/TypeScript for RepuSense (Google Maps, Yelp, TripAdvisor, and contact enrichment).
---

# Scraping Pipeline & Data Extraction Guide

This skill governs the development of automated scrapers for **RepuSense**, specializing in extracting local businesses with reputation issues (1.5 - 3.5 stars, >10 reviews) and discovering contact details.

## Core Stack & Tooling

- **Runtime:** Node.js with TypeScript (`tsx` for dev execution).
- **Extraction Engine:** [Crawlee](https://crawlee.dev/) + Playwright / Puppeteer (`PlaywrightCrawler` / `PuppeteerCrawler` with `@crawlee/puppeteer` or `cheerio` for light parsing).
- **Anti-Bot / Stealth:** `puppeteer-extra-plugin-stealth` or Playwright stealth techniques, human-like typing/scrolling, randomized delays.

## Target Directories & Rules

### 1. Google Maps & Local Directories
- **Search Query Structure:** `"<industry> in <city>"` (e.g., `"clinicas dentales en Bogota"`, `"restaurantes en Ciudad de Mexico"`).
- **Qualification Filters (Strict):**
  - Average rating between **1.5 and 3.5 stars**.
  - Total review count **>= 10** (validates the business is active with meaningful customer feedback).
  - Exclude permanently closed businesses.
- **Fields to Extract:**
  - `name`: Business legal / commercial name.
  - `category`: Primary business category.
  - `rating`: Overall score (float).
  - `reviewCount`: Integer.
  - `address`: Street, city, postal code.
  - `phone`: Listed telephone number.
  - `website`: Official website URL.
  - `googleMapsUrl` / `sourceUrl`: Direct canonical link.
  - `recentNegativeReviews`: Array of 3 to 5 recent reviews with <= 3 stars (text, author, rating, date).

### 2. Contact Enrichment Crawler (Website / Social)
When a business website is present:
- Fetch homepage and `/contacto`, `/contact`, `/nosotros`, `/about`, `/politica-de-privacidad`.
- Extract emails: Regex scan for `mailto:` links and email patterns (`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`).
- Extract social links: Instagram, Facebook, LinkedIn, Twitter/X, WhatsApp link (`wa.me`).
- Fallback: Store domain contact form URL if no direct email is discovered.

## Anti-Blocking & Evasion Strategy

1. **Request Throttling & Delays:**
   - Sleep 2-5 seconds between pagination and search result clicks.
   - Avoid concurrency > 2-3 workers per source in local MVP execution.
2. **Fingerprint Mimicking:**
   - Rotate common desktop User-Agents (Chrome on Windows/macOS).
   - Set real browser viewport sizes (e.g., 1920x1080) and locale matching the target country (e.g., `es-CO`, `es-MX`).
3. **Graceful Degradation:**
   - Detect CAPTCHA or blocking responses (HTTP 403, 429, Cloudflare challenge).
   - On block detection, pause worker, log warning, and backoff exponentially rather than crashing.

## Data Normalization & Output Schema

All scrapers must output records adhering to the shared TypeScript interface:

```typescript
export interface RawBusinessLead {
  externalId: string; // e.g. Place ID or source URL hash
  source: 'google_maps' | 'yelp' | 'tripadvisor';
  name: string;
  category: string;
  city: string;
  address?: string;
  rating: number;
  reviewCount: number;
  phone?: string;
  website?: string;
  sourceUrl: string;
  emails: string[];
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    whatsapp?: string;
  };
  negativeReviews: Array<{
    author?: string;
    rating: number;
    text: string;
    date?: string;
  }>;
  scrapedAt: string; // ISO date string
}
```

## Testing & Validation Commands
- Run individual source tests with isolated inputs:
  `npx tsx src/scrapers/google-maps.test.ts --city="Bogota" --query="restaurante" --limit=5`
- Always verify extracted data against the normalization schema before passing to backend API.
