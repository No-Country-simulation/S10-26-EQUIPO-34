import { Controller, Post, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { EnrichmentService } from './enrichment.service';

@Controller('leads/:id/enrichment')
export class EnrichmentController {
  constructor(private readonly enrichmentService: EnrichmentService) {}

  @Post()
  async enrichLead(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrichmentService.enrichLead(id);
  }

  @Get()
  async getEnrichment(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrichmentService.getEnrichmentByLeadId(id);
  }
}
