import { Module } from '@nestjs/common';
import { ThueCongViecController } from './thue-cong-viec.controller';
import { ThueCongViecService } from './thue-cong-viec.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ThueCongViecController],
  providers: [ThueCongViecService, PrismaService],
  exports: [ThueCongViecService],
})
export class ThueCongViecModule {}
