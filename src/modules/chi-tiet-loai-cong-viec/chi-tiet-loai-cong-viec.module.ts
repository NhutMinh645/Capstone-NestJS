import { Module } from '@nestjs/common';
import { ChiTietLoaiController } from './chi-tiet-loai-cong-viec.controller';
import { ChiTietLoaiService } from './chi-tiet-loai-cong-viec.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ChiTietLoaiController],
  providers: [ChiTietLoaiService, PrismaService],
  exports: [ChiTietLoaiService],
})
export class ChiTietLoaiModule {}
