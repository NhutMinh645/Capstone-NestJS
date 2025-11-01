import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { CreateThueCongViecDto } from './create-thue-cong-viec.dto';

class BaseUpdateThueCongViecDto {
  @ApiProperty({ example: 1002, required: false })
  @IsOptional()
  @IsInt()
  congViecId?: number;

  @ApiProperty({ example: '2025-11-01T12:00:00.000Z', required: false })
  @IsOptional()
  ngayThue?: Date;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  hoanThanh?: boolean;
}
export class UpdateThueCongViecDto extends PartialType(BaseUpdateThueCongViecDto) {}
