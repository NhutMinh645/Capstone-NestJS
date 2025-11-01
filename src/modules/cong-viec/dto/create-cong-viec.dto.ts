import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCongViecDto {
  @IsNotEmpty()
  tenCongViec: string;

  @IsOptional()
  moTa?: string;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  giaTien: number;

  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  chiTietLoaiCongViecId: number;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? 0 : parseInt(value, 10)))
  @IsInt()
  saoDanhGia?: number = 0;
}
