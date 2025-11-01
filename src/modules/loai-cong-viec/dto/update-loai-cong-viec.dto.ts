import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { CreateLoaiCongViecDto } from './create-loai-cong-viec.dto';

class BaseUpdateLoaiCongViecDto {
  @ApiProperty({ example: 'Thiết kế đồ họa', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  tenLoaiCongViec?: string;
}

export class UpdateLoaiCongViecDto extends PartialType(BaseUpdateLoaiCongViecDto) {}
