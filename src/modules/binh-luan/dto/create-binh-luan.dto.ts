import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateBinhLuanDto {
  @IsString() @IsNotEmpty()
  noiDung: string;

  @IsInt()
  nguoiDungId: number;

  @IsInt()
  congViecId: number;

  @IsInt() @Min(1) @Max(5)
  saoBinhLuan: number;
}
