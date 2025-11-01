import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum RoleDto { ADMIN = 'ADMIN', USER = 'USER' }

export class SignupDto {
  @ApiProperty({ example: 'Alice' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'USER', required: false, enum: RoleDto })
  @IsOptional()
  @IsEnum(RoleDto)
  role?: RoleDto;

  @ApiProperty({ example: '0900000000', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
