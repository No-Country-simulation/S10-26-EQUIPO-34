import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from './gemini.service';

@Injectable()
export class EnrichmentService {
  private readonly logger = new Logger(EnrichmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
  ) {}

  async enrichLead(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        reviews: {
          where: { rating: { lte: 3.5 } },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with id ${leadId} not found`);
    }

    const reviewInputs = lead.reviews.map((r) => ({
      rating: r.rating,
      text: r.text,
    }));

    // Si el lead no tiene reseñas negativas guardadas aún, usamos un placeholder genérico
    const reviewsToAnalyze =
      reviewInputs.length > 0
        ? reviewInputs
        : [
            {
              rating: lead.rating,
              text: `Calificación promedio de ${lead.rating} estrellas basada en ${lead.reviewCount} opiniones de clientes.`,
            },
          ];

    const result = await this.geminiService.analyzeReviewsAndGeneratePitch({
      businessName: lead.name,
      category: lead.category,
      city: lead.city,
      reviews: reviewsToAnalyze,
    });

    const enrichment = await this.prisma.enrichment.upsert({
      where: { leadId: lead.id },
      create: {
        leadId: lead.id,
        primaryIssue: result.primaryIssue,
        category: result.category,
        summaryReason: result.summaryReason,
        severity: result.severity,
        emailSubject: result.emailSubject,
        emailOpeningHook: result.emailOpeningHook,
        emailBodyDraft: result.emailBodyDraft,
      },
      update: {
        primaryIssue: result.primaryIssue,
        category: result.category,
        summaryReason: result.summaryReason,
        severity: result.severity,
        emailSubject: result.emailSubject,
        emailOpeningHook: result.emailOpeningHook,
        emailBodyDraft: result.emailBodyDraft,
        generatedAt: new Date(),
      },
    });

    this.logger.log(`Enriched lead ${lead.name} (${lead.id}) successfully with issue: ${result.primaryIssue}`);
    return enrichment;
  }

  async getEnrichmentByLeadId(leadId: string) {
    const enrichment = await this.prisma.enrichment.findUnique({
      where: { leadId },
    });
    if (!enrichment) {
      throw new NotFoundException(`No enrichment found for lead ${leadId}`);
    }
    return enrichment;
  }
}
