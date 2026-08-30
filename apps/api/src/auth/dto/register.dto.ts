import { ApiProperty } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

const trimValue = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class RegisterDto {
  @ApiProperty({ example: 'customer@example.com', maxLength: 320 })
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ minLength: 12, maxLength: 72, writeOnly: true })
  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ example: 'Ayşe', minLength: 2, maxLength: 100 })
  @Transform(trimValue)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Yılmaz', minLength: 2, maxLength: 100 })
  @Transform(trimValue)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName!: string;
}
