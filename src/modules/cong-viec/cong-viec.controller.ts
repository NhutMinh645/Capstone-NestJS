import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CongViecService } from "./cong-viec.service";
import { JwtGuard } from "../../common/guards/jwt.guard";
import { AdminGuard } from "../../common/guards/admin.guard";
import { ChiTietLoaiService } from "../chi-tiet-loai-cong-viec/chi-tiet-loai-cong-viec.service";

@ApiTags("CongViec")
@Controller("cong-viec")
export class CongViecController {
  constructor(
    private svc: CongViecService,
    private ctlSvc: ChiTietLoaiService
  ) {}

  @Get("lay-menu-loai-cong-viec")
  getMenuLoaiCongViec() {
    return this.svc.getMenuLoaiCongViec();
  }

  @Get("lay-chi-tiet-loai-cong-viec/:loaiId(\\d+)")
  getChiTietTheoLoai(@Param("loaiId", ParseIntPipe) loaiId: number) {
    return this.ctlSvc.getChiTietTheoLoai(loaiId);
  }

  @Get("lay-cong-viec-theo-chi-tiet-loai/:chiTietId(\\d+)")
  getCongViecTheoChiTiet(@Param("chiTietId", ParseIntPipe) chiTietId: number) {
    return this.svc.getCongViecTheoChiTiet(chiTietId);
  }

  @Get("lay-cong-viec-chi-tiet/:id(\\d+)")
  getCongViecChiTiet(@Param("id", ParseIntPipe) id: number) {
    return this.svc.getCongViecChiTiet(id);
  }
  @Get("lay-danh-sach-cong-viec-theo-ten/:ten")
  getCongViecTheoTen(@Param("ten") ten: string) {
    return this.svc.getCongViecTheoTen(ten);
  }

  @Get()
  list() {
    return this.svc.list();
  }

  @Post()
  @UseGuards(JwtGuard, AdminGuard)
  create() {}

  @Get(":id(\\d+)")
  detail(@Param("id", ParseIntPipe) id: number) {
    return this.svc.detail(id);
  }

  @Put(":id(\\d+)")
  @UseGuards(JwtGuard, AdminGuard)
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: any) {
    return this.svc.update(id, dto);
  }

  @Delete(":id(\\d+)")
  @UseGuards(JwtGuard, AdminGuard)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
