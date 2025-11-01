import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { RoleDto } from './create-user.dto';

class BaseUserDto {
  @ApiProperty({ example: 'Alice New', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'alice.new@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'USER', required: false, enum: RoleDto })
  @IsOptional()
  @IsEnum(RoleDto)
  role?: RoleDto;

  @ApiProperty({ example: '0900000001', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  // Cho phép admin đổi mật khẩu; nếu không muốn thì bỏ field này.
  @ApiProperty({ example: 'newSecret123', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional() @IsString()
  avatar?: string;
}

export class UpdateUserDto extends PartialType(BaseUserDto) {}
