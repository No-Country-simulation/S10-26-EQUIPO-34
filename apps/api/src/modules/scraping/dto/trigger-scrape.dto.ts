import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { LeadSource } from '@prisma/client';

export class TriggerScrapeDto {
  @IsString()
  city: string;

  @IsString()
  industry: string;

  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource = LeadSource.GOOGLE_MAPS;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(5)
  @Max(200)
  maxResults?: number = 30;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRating?: number = 1.5;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxRating?: number = 3.5;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minReviews?: number = 10;
}
