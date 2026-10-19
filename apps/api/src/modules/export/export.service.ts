import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryLeadDto } from '../leads/dto/query-lead.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async generateLeadsCsv(query: QueryLeadDto): Promise<string> {
    const where: Prisma.LeadWhereInput = {};

    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' };
    }

    if (query.category) {
      where.category = { contains: query.category, mode: 'insensitive' };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.hasEmail) {
      where.contacts = { some: { email: { not: null } } };
    }

    const leads = await this.prisma.lead.findMany({
      where,
      include: {
        contacts: true,
        enrichment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const headers = [
      'ID',
      'Nombre',
      'Rubro',
      'Ciudad',
      'Direccion',
      'Calificacion',
      'Total_Resenas',
      'Telefono',
      'Sitio_Web',
      'Email_Principal',
      'Todos_Emails',
      'LinkedIn',
      'WhatsApp',
      'Problema_IA',
      'Asunto_Cold_Email',
      'Gancho_Cold_Email',
      'Estado_Prospeccion',
      'URL_Origen',
    ];

    const escapeCsv = (val?: string | number | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${str}"`;
    };

    const rows = leads.map((lead) => {
      const emails = lead.contacts
        .map((c) => c.email)
        .filter(Boolean) as string[];
      const primaryEmail = emails[0] || '';
      const linkedins = lead.contacts
        .map((c) => c.linkedinUrl)
        .filter(Boolean) as string[];
      const whatsapps = lead.contacts
        .map((c) => c.whatsappUrl)
        .filter(Boolean) as string[];

      return [
        escapeCsv(lead.id),
        escapeCsv(lead.name),
        escapeCsv(lead.category),
        escapeCsv(lead.city),
        escapeCsv(lead.address),
        escapeCsv(lead.rating),
        escapeCsv(lead.reviewCount),
        escapeCsv(lead.phone),
        escapeCsv(lead.website),
        escapeCsv(primaryEmail),
        escapeCsv(emails.join('; ')),
        escapeCsv(linkedins.join('; ')),
        escapeCsv(whatsapps.join('; ')),
        escapeCsv(lead.enrichment?.primaryIssue),
        escapeCsv(lead.enrichment?.emailSubject),
        escapeCsv(lead.enrichment?.emailOpeningHook),
        escapeCsv(lead.status),
        escapeCsv(lead.sourceUrl),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}
