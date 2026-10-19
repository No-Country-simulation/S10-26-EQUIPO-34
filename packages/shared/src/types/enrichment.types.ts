export type CrisisCategory =
  | 'MALA_ATENCION'
  | 'TIEMPOS_ESPERA'
  | 'HIGIENE_CALIDAD'
  | 'PRECIOS_COBROS'
  | 'COMUNICACION_SEGUIMIENTO'
  | 'OTRO';

export type CrisisSeverity = 'ALTA' | 'MEDIA' | 'BAJA';

export interface EnrichmentResult {
  id?: string;
  leadId: string;
  primaryIssue: string;
  category: CrisisCategory;
  summaryReason: string;
  severity: CrisisSeverity;
  emailSubject: string;
  emailOpeningHook: string;
  emailBodyDraft?: string | null;
  generatedAt: string;
}

export interface EnrichmentRequest {
  leadId: string;
  businessName: string;
  category: string;
  city: string;
  reviews: Array<{
    rating: number;
    text: string;
  }>;
}
