import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LeadSource, LeadStatus } from '@prisma/client';

export class CreateContactDetailDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  whatsappUrl?: string;

  @IsOptional()
  @IsString()
  source?: string;
}

export class CreateReviewDto {
  @IsOptional()
  @IsString()
  author?: string;

  @Type(() => Number)
  @IsNumber()
  rating: number;

  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  reviewDate?: string;
}

export class CreateLeadDto {
  @IsString()
  externalId: string;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  address?: string;

  @Type(() => Number)
  @IsNumber()
  rating: number;

  @Type(() => Number)
  @IsNumber()
  reviewCount: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @IsString()
  sourceUrl: string;

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContactDetailDto)
  contacts?: CreateContactDetailDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReviewDto)
  reviews?: CreateReviewDto[];
}
