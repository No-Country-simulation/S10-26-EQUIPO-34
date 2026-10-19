import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, LeadStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryLeadDto } from './dto/query-lead.dto';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryLeadDto) {
    const {
      city,
      category,
      minRating,
      maxRating,
      minReviews,
      hasEmail,
      hasPhone,
      status,
      search,
      page = 1,
      limit = 20,
    } = query;

    const where: Prisma.LeadWhereInput = {};

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (minRating !== undefined || maxRating !== undefined) {
      where.rating = {
        ...(minRating !== undefined ? { gte: minRating } : {}),
        ...(maxRating !== undefined ? { lte: maxRating } : {}),
      };
    }

    if (minReviews !== undefined) {
      where.reviewCount = { gte: minReviews };
    }

    if (status) {
      where.status = status;
    }

    if (hasEmail) {
      where.contacts = {
        some: {
          email: { not: null },
        },
      };
    }

    if (hasPhone) {
      where.OR = [
        { phone: { not: null } },
        { contacts: { some: { phone: { not: null } } } },
      ];
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ rating: 'asc' }, { reviewCount: 'desc' }],
        include: {
          contacts: true,
          enrichment: true,
          _count: {
            select: { reviews: true },
          },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        contacts: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        enrichment: true,
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }

    return lead;
  }

  async updateStatus(id: string, status: LeadStatus) {
    await this.findOne(id);

    return this.prisma.lead.update({
      where: { id },
      data: { status },
      include: {
        contacts: true,
        enrichment: true,
      },
    });
  }

  async upsertLead(dto: CreateLeadDto) {
    const { contacts, reviews, ...leadData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.upsert({
        where: { externalId: leadData.externalId },
        create: {
          ...leadData,
        },
        update: {
          rating: leadData.rating,
          reviewCount: leadData.reviewCount,
          phone: leadData.phone ?? undefined,
          website: leadData.website ?? undefined,
          address: leadData.address ?? undefined,
        },
      });

      if (contacts && contacts.length > 0) {
        for (const contact of contacts) {
          if (contact.email || contact.phone || contact.linkedinUrl || contact.instagramUrl) {
            await tx.contactDetail.create({
              data: {
                leadId: lead.id,
                ...contact,
              },
            });
          }
        }
      }

      if (reviews && reviews.length > 0) {
        for (const review of reviews) {
          await tx.review.create({
            data: {
              leadId: lead.id,
              ...review,
            },
          });
        }
      }

      return lead;
    });
  }

  async getMetrics() {
    const [totalLeads, leadsWithEmail, avgRatingData, criticalLeads] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({
        where: {
          contacts: {
            some: {
              email: { not: null },
            },
          },
        },
      }),
      this.prisma.lead.aggregate({
        _avg: {
          rating: true,
        },
      }),
      this.prisma.lead.count({
        where: {
          rating: { lte: 2.5 },
        },
      }),
    ]);

    return {
      totalLeads,
      leadsWithEmail,
      avgRating: avgRatingData._avg.rating ? Number(avgRatingData._avg.rating.toFixed(2)) : 0,
      criticalLeads,
    };
  }
}
