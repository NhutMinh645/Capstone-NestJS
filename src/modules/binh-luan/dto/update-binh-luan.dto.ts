import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CreateBinhLuanDto } from './create-binh-luan.dto';

class BaseUpdateBinhLuanDto {
  @ApiProperty({ example: 'Cập nhật: rất hài lòng!', required: false })
  @IsOptional()
  @IsString()
  noiDung?: string;

  @ApiProperty({ example: 4, required: false, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  saoBinhLuan?: number;
}

export class UpdateBinhLuanDto extends PartialType(CreateBinhLuanDto) {}
