import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SearchThueCongViecDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  pageIndex: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  pageSize: number = 10;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  congViecId?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  nguoiDungId?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === undefined || value === null) return undefined;
    const v = String(value).toLowerCase();
    if (v === 'true' || v === '1')  return true;
    if (v === 'false' || v === '0') return false;
    return undefined; 
  })
  @IsBoolean()
  hoanThanh?: boolean;
}
