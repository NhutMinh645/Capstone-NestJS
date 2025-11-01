import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class SearchLoaiQueryDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1))
  pageIndex: number = 1;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value ? parseInt(value, 10) : 10))
  pageSize: number = 10;

  @IsOptional()
  keyword?: string;
}
