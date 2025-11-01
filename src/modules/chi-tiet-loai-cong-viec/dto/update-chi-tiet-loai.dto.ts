import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';
// import { CreateChiTietLoaiDto } from './create-chi-tiet-loai.dto';

class BaseUpdateChiTietLoaiDto {
  @ApiProperty({ example: 'Logo Expert', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  tenChiTiet?: string;

  @ApiProperty({ example: '/uploads/logo-new.png', required: false })
  @IsOptional()
  @IsString()
  hinhAnh?: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  loaiCongViecId?: number;
}

export class UpdateChiTietLoaiDto extends PartialType(BaseUpdateChiTietLoaiDto) {}
