---
name: frontend-react
description: >-
  Use this skill when implementing, styling, or refactoring the RepuSense sales dashboard in React with TypeScript.
---

# React Frontend Sales Dashboard Guide

This skill governs the front-end user interface for **RepuSense**, built with **React**, **TypeScript**, and modern UI tooling.

## Tech Stack & Architecture

- **Build Tool:** Vite + React (`@vitejs/plugin-react`).
- **Language:** TypeScript with strict type checking.
- **Styling:** Tailwind CSS + UI components (e.g. Radix UI / Shadcn / Lucide-react for icons).
- **Data Fetching & Caching:** `@tanstack/react-query` (TanStack Query) + Axios / Fetch client.
- **Table / Data Grid:** `@tanstack/react-table` for sorting, column filtering, and pagination.

## Project Structure

```text
src/
├── assets/            # Static icons, logos
├── components/
│   ├── common/        # Badges, Buttons, Modals, Loaders
│   ├── layout/        # Navbar, Sidebar, AppLayout
│   ├── leads/         # LeadsTable, LeadFilters, LeadDrawer
│   ├── outreach/      # EmailDraftModal, CopyHookButton
│   └── scraping/      # TriggerScrapeModal, JobsProgressBanner
├── hooks/             # useLeads, useScrapingJobs, useDebounce
├── services/          # api.ts (typed axios/fetch wrapper)
├── types/             # Lead, Review, Enrichment, FilterState interfaces
└── pages/
    ├── DashboardPage.tsx
    ├── LeadDetailPage.tsx
    └── ScrapingJobsPage.tsx
```

## Key Views & Functional Requirements

### 1. Prospección Dashboard (Main View)
- **Top Filter Bar:**
  - City dropdown / input.
  - Category / Industry filter.
  - Rating range slider or selector (e.g., `< 3.5`).
  - Contact filter checkbox (`Only with verified email / phone`).
  - Status filter (`New`, `Contacted`, `All`).
- **Stats Counter:** Total leads, Leads with Email, Average Rating, Crisis Alerts.
- **Interactive Leads Table:**
  - Columns: Business Name, City/Category, Rating (colored badge: red <2.5, orange 2.5-3.5), Review Count, Discovered Emails/Phones, Primary Crisis Tag (AI), Actions.
  - Row Actions: "Ver Detalle", "Copiar Email Pitch", "Marcar como Contactado".

### 2. Cold Outreach & Lead Detail Drawer / Modal
- Visualizes:
  - Top negative customer complaints with direct review quotes.
  - AI Identified Root Cause (e.g., *"Problemas recurrentes con tiempos de espera y reservas"*).
  - **Cold Email Generator Box:**
    - Input: Target contact name / custom offer note.
    - Output: Auto-generated Subject (`Asunto`) and personalized hook paragraph (`Gancho`).
    - One-click copy buttons (`Copiar Asunto`, `Copiar Párrafo`, `Copiar Todo`).

### 3. CSV Export Tool
- Instant client-side or server-side download of the filtered view into `.csv` formatted for CRM / cold email tools (Lemlist, Instantly, HubSpot).

## Best Practices & UX Guidelines
- **Responsive & Scannable:** Sales reps prioritize speed. Use compact table row heights, keyboard shortcuts, and clear status badges.
- **Optimistic Updates:** When a rep marks a lead as "Contacted", update the UI immediately without waiting for full refetch.
- **Empty States:** Provide helpful guidance and quick sample queries when no leads are found.
