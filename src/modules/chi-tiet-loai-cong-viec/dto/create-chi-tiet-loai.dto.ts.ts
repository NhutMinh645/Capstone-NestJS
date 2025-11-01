import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateChiTietLoaiDto {
  @ApiProperty({ example: 'Logo & Branding', description: 'Tên chi tiết loại' })
  @IsString()
  @MinLength(2)
  tenChiTiet!: string;

  @ApiProperty({ example: '/uploads/logo.png', required: false })
  @IsOptional()
  @IsString()
  hinhAnh?: string;

  @ApiProperty({ example: 1, description: 'ID loại công việc' })
  @IsInt()
  loaiCongViecId!: number;
}
