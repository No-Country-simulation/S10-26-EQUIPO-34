import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { QueryLeadDto } from '../leads/dto/query-lead.dto';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('csv')
  async exportCsv(@Query() query: QueryLeadDto, @Res() res: Response) {
    const csvContent = await this.exportService.generateLeadsCsv(query);

    const filename = `repusense_leads_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  }
}
