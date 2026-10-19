export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'IN_CONVERSATION'
  | 'DISQUALIFIED'
  | 'CONVERTED';

export type LeadSource = 'GOOGLE_MAPS' | 'YELP' | 'TRIPADVISOR';

export interface ContactDetail {
  id?: string;
  leadId?: string;
  email?: string | null;
  phone?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  whatsappUrl?: string | null;
  source: 'WEBSITE_CRAWL' | 'MANUAL';
  verified?: boolean;
}

export interface ReviewItem {
  id?: string;
  leadId?: string;
  author?: string | null;
  rating: number;
  text: string;
  reviewDate?: string | null;
}

export interface Lead {
  id: string;
  externalId: string;
  name: string;
  category: string;
  city: string;
  address?: string | null;
  rating: number;
  reviewCount: number;
  phone?: string | null;
  website?: string | null;
  source: LeadSource;
  sourceUrl: string;
  status: LeadStatus;
  contacts?: ContactDetail[];
  reviews?: ReviewItem[];
  enrichment?: import('./enrichment.types').EnrichmentResult | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilters {
  city?: string;
  category?: string;
  minRating?: number;
  maxRating?: number;
  minReviews?: number;
  hasEmail?: boolean;
  hasPhone?: boolean;
  status?: LeadStatus;
  search?: string;
  page?: number;
  limit?: number;
}
