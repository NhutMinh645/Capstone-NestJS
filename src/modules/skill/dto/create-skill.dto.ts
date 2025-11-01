import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({ example: 'Photoshop', description: 'Tên skill' })
  @IsString()
  @MinLength(2)
  tenSkill!: string; // đổi sang "name" nếu schema của bạn dùng name

  @ApiProperty({ example: 'Thiết kế đồ hoạ cơ bản', required: false })
  @IsOptional()
  @IsString()
  moTa?: string;
}
