import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ResponseInterceptor } from "../../common/response.interceptor";
import { LoaiCongViecService } from "./loai-cong-viec.service";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { ApiResponseDto } from "../../common/swagger/dtos";
import { JwtGuard } from "../../common/guards/jwt.guard";
import { AdminGuard } from "../../common/guards/admin.guard";
import { CreateLoaiCongViecDto } from "./dto/create-loai-cong-viec.dto";
import { UpdateLoaiCongViecDto } from "./dto/update-loai-cong-viec.dto";

@UseInterceptors(ResponseInterceptor)
@ApiTags("LoaiCongViec")
@Controller("loai-cong-viec")
export class LoaiCongViecController {
  constructor(private svc: LoaiCongViecService) {}

  // Danh sách (phân trang + keyword)
  @Get()
  @ApiOperation({ summary: "Danh sách loại công việc" })
  @ApiQuery({ name: "pageIndex", required: false, type: Number })
  @ApiQuery({ name: "pageSize", required: false, type: Number })
  @ApiQuery({ name: "keyword", required: false })
  @ApiOkResponse({ type: ApiResponseDto })
  list(
    @Query("pageIndex") pageIndex?: number,
    @Query("pageSize") pageSize?: number,
    @Query("keyword") keyword?: string
  ) {
    return this.svc.list(Number(pageIndex), Number(pageSize), keyword);
  }

  // Tìm kiếm (alias)
  @Get("search")
  @ApiOperation({ summary: "Tìm kiếm loại công việc (phân trang)" })
  @ApiQuery({ name: "pageIndex", required: false, type: Number })
  @ApiQuery({ name: "pageSize", required: false, type: Number })
  @ApiQuery({ name: "keyword", required: false })
  @ApiOkResponse({ type: ApiResponseDto })
  search(
    @Query("pageIndex") pageIndex?: number,
    @Query("pageSize") pageSize?: number,
    @Query("keyword") keyword?: string
  ) {
    return this.svc.search(Number(pageIndex), Number(pageSize), keyword);
  }

  // Chi tiết
  @Get(":id(\\d+)")
  @ApiOperation({ summary: "Chi tiết loại công việc" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  detail(@Param("id", ParseIntPipe) id: number) {
    return this.svc.detail(id);
  }

  // Tạo (ADMIN)
  @Post()
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Tạo loại công việc (ADMIN)" })
  @ApiOkResponse({ type: ApiResponseDto })
  create(@Body() dto: CreateLoaiCongViecDto) {
    return this.svc.create(dto);
  }

  // Cập nhật (ADMIN)
  @Put(":id(\\d+)")
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Cập nhật loại công việc (ADMIN)" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateLoaiCongViecDto
  ) {
    return this.svc.update(id, dto);
  }

  // Xoá (ADMIN)
  @Delete(":id(\\d+)")
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Xoá loại công việc (ADMIN)" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  remove(
  @Param('id', ParseIntPipe) id: number,
  @Query('force') force?: string,
) {
  return force === 'true'
    ? this.svc.removeForce(id)
    : this.svc.remove(id);
}
}
