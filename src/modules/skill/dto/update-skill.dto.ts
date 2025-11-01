import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSkillDto } from './create-skill.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

class BaseUpdateSkillDto {
  @ApiProperty({ example: 'Photoshop nâng cao', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  tenSkill?: string;

  @ApiProperty({ example: 'Mô tả mới', required: false })
  @IsOptional()
  @IsString()
  moTa?: string;
}

export class UpdateSkillDto extends PartialType(BaseUpdateSkillDto) {}
