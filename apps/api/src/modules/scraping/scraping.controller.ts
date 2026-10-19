import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { TriggerScrapeDto } from './dto/trigger-scrape.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('scraping')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Post('jobs')
  async triggerJob(@Body() dto: TriggerScrapeDto) {
    return this.scrapingService.triggerJob(dto);
  }

  @Get('jobs')
  async getJobs(@Query() pagination: PaginationDto) {
    return this.scrapingService.getJobs(pagination.page, pagination.limit);
  }

  @Get('jobs/:id')
  async getJobById(@Param('id', ParseUUIDPipe) id: string) {
    return this.scrapingService.getJobById(id);
  }
}
