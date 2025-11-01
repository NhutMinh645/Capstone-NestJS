import { Module } from "@nestjs/common";
import { CongViecController } from "./cong-viec.controller";
import { CongViecService } from "./cong-viec.service";
import { PrismaService } from "../../prisma.service";
import { ChiTietLoaiModule } from "../chi-tiet-loai-cong-viec/chi-tiet-loai-cong-viec.module";
@Module({
  imports: [ChiTietLoaiModule],
  controllers: [CongViecController],
  providers: [CongViecService, PrismaService],
})
export class CongViecModule {}
