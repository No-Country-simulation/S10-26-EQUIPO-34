import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { EnrichmentService } from './enrichment.service';
import { EnrichmentController } from './enrichment.controller';

@Module({
  controllers: [EnrichmentController],
  providers: [GeminiService, EnrichmentService],
  exports: [EnrichmentService, GeminiService],
})
export class EnrichmentModule {}
