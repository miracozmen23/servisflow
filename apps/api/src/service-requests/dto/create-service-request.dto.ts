import { ApiProperty } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsDateString,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const trimValue = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateServiceRequestDto {
  @ApiProperty({ example: 'Lenovo', minLength: 2, maxLength: 100 })
  @Transform(trimValue)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  brand!: string;

  @ApiProperty({ example: 'ThinkPad E14', minLength: 2, maxLength: 100 })
  @Transform(trimValue)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  model!: string;

  @ApiProperty({ example: 'PF123456', minLength: 1, maxLength: 100 })
  @Transform(trimValue)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  serialNumber!: string;

  @ApiProperty({ example: 'INV-2026-001', minLength: 1, maxLength: 100 })
  @Transform(trimValue)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  invoiceNumber!: string;

  @ApiProperty({ example: '2025-08-30', format: 'date' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true, strictSeparator: true })
  purchaseDate!: string;

  @ApiProperty({
    example: 'Cihaz açılış sırasında kendiliğinden kapanıyor.',
    minLength: 10,
    maxLength: 2000,
  })
  @Transform(trimValue)
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  problemDescription!: string;
}
