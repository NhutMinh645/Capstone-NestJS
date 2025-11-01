import { Module } from '@nestjs/common';
import { BinhLuanController } from './binh-luan.controller';
import { BinhLuanService } from './binh-luan.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [BinhLuanController],
  providers: [BinhLuanService, PrismaService],
  exports: [BinhLuanService],
})
export class BinhLuanModule {}
