import { LeadSource } from './lead.types';

export type ScrapingJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface ScrapingJob {
  id: string;
  city: string;
  industry: string;
  source: LeadSource;
  status: ScrapingJobStatus;
  leadsFound: number;
  leadsAdded: number;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface TriggerScrapeRequest {
  city: string;
  industry: string;
  source?: LeadSource;
  maxResults?: number;
  minRating?: number;
  maxRating?: number;
  minReviews?: number;
}

export interface RawReviewData {
  author?: string;
  rating: number;
  text: string;
  date?: string;
}

export interface RawBusinessLead {
  externalId: string;
  source: LeadSource;
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
  negativeReviews: RawReviewData[];
  scrapedAt: string;
}
