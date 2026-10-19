import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ScrapingJobStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TriggerScrapeDto } from './dto/trigger-scrape.dto';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async triggerJob(dto: TriggerScrapeDto) {
    const job = await this.prisma.scrapingJob.create({
      data: {
        city: dto.city,
        industry: dto.industry,
        source: dto.source,
        status: ScrapingJobStatus.PENDING,
      },
    });

    this.logger.log(`Created scraping job ${job.id} for "${dto.industry}" in "${dto.city}"`);

    // In a production / async environment, this dispatches to BullMQ / Worker queue.
    // For local MVP, we log the job and mark it ready for worker pickup or direct dispatch.
    return job;
  }

  async getJobs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.scrapingJob.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.scrapingJob.count(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getJobById(id: string) {
    const job = await this.prisma.scrapingJob.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Scraping job with id ${id} not found`);
    }

    return job;
  }

  async updateJobStatus(
    id: string,
    params: {
      status: ScrapingJobStatus;
      leadsFound?: number;
      leadsAdded?: number;
      errorMessage?: string;
    },
  ) {
    await this.getJobById(id);

    return this.prisma.scrapingJob.update({
      where: { id },
      data: {
        status: params.status,
        ...(params.leadsFound !== undefined ? { leadsFound: params.leadsFound } : {}),
        ...(params.leadsAdded !== undefined ? { leadsAdded: params.leadsAdded } : {}),
        ...(params.errorMessage !== undefined ? { errorMessage: params.errorMessage } : {}),
        ...(params.status === ScrapingJobStatus.RUNNING ? { startedAt: new Date() } : {}),
        ...(params.status === ScrapingJobStatus.COMPLETED || params.status === ScrapingJobStatus.FAILED
          ? { completedAt: new Date() }
          : {}),
      },
    });
  }
}
