import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreateThueCongViecDto {
  @ApiProperty({ example: 1001, description: 'ID công việc cần thuê' })
  @IsInt()
  congViecId!: number;

  @ApiProperty({ example: '2025-10-30T09:00:00.000Z', required: false, description: 'Ngày thuê, mặc định now()' })
  @IsOptional()
  ngayThue?: Date;

  @ApiProperty({ example: false, required: false, description: 'Trạng thái hoàn thành (mặc định false khi tạo)' })
  @IsOptional()
  @IsBoolean()
  hoanThanh?: boolean;
}
