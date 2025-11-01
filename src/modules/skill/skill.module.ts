import { Module } from "@nestjs/common";
import { SkillController } from "./skill.controller";
import { SkillService } from "./skill.service";
import { PrismaService } from "../../prisma.service";
import { MulterModule } from '@nestjs/platform-express';
@Module({
  imports: [
  MulterModule.register({ dest: './uploads' }),
  ],
  controllers: [SkillController],
  providers: [SkillService, PrismaService],
  exports: [SkillService],
})
export class SkillModule {}
