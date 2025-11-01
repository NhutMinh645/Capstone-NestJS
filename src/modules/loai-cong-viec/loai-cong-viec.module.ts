import { Module } from '@nestjs/common';
import { LoaiCongViecController } from './loai-cong-viec.controller';
import { LoaiCongViecService } from './loai-cong-viec.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [LoaiCongViecController],
  providers: [LoaiCongViecService, PrismaService],
  exports: [LoaiCongViecService],
})
export class LoaiCongViecModule {}
