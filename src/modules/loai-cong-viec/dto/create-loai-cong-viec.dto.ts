import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateLoaiCongViecDto {
  @ApiProperty({ example: 'Thiết kế', description: 'Tên loại công việc' })
  @IsString()
  @MinLength(2)
  tenLoaiCongViec!: string;
}
