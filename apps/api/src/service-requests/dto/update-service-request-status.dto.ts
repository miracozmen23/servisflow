import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ServiceRequestStatus } from '../../generated/prisma/client';

const trimValue = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateServiceRequestStatusDto {
  @ApiProperty({ enum: ServiceRequestStatus })
  @IsEnum(ServiceRequestStatus)
  status!: ServiceRequestStatus;

  @ApiPropertyOptional({ minLength: 10, maxLength: 500 })
  @Transform(trimValue)
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  resolutionSummary?: string;

  @ApiPropertyOptional({ minLength: 1, maxLength: 500 })
  @Transform(trimValue)
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  customerMessage?: string;
}
