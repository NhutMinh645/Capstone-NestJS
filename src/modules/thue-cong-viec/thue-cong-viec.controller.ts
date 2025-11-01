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
import { ThueCongViecService } from "./thue-cong-viec.service";
import { JwtGuard } from "../../common/guards/jwt.guard";
import { AdminGuard } from "../../common/guards/admin.guard";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { ApiResponseDto } from "../../common/swagger/dtos";
import { CreateThueCongViecDto } from "./dto/create-thue-cong-viec.dto";
import { UpdateThueCongViecDto } from "./dto/update-thue-cong-viec.dto";
import { CurrentUser } from "../../common/decorators/user.decorator";
import { SearchThueCongViecDto } from "./dto/search-ctl.dto";

@UseInterceptors(ResponseInterceptor)
@ApiTags("ThueCongViec")
@Controller("thue-cong-viec")
export class ThueCongViecController {
  constructor(private svc: ThueCongViecService) {}

  // Danh sách (phân trang + lọc)
  @Get()
  @ApiOperation({ summary: "Danh sách thuê (có phân trang & lọc)" })
  @ApiQuery({ name: "pageIndex", required: false, type: Number })
  @ApiQuery({ name: "pageSize", required: false, type: Number })
  @ApiQuery({ name: "congViecId", required: false, type: Number })
  @ApiQuery({ name: "nguoiDungId", required: false, type: Number })
  @ApiQuery({ name: "hoanThanh", required: false, type: Boolean })
  @ApiOkResponse({ type: ApiResponseDto })
  list(@Query() q: SearchThueCongViecDto) {
    return this.svc.list(q.pageIndex, q.pageSize, {
      congViecId: q.congViecId,
      nguoiDungId: q.nguoiDungId,
      hoanThanh: q.hoanThanh,
    });
  }

  // Chi tiết
  @Get(":id(\\d+)")
  @ApiOperation({ summary: "Chi tiết đơn thuê" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  detail(@Param("id", ParseIntPipe) id: number) {
    return this.svc.detail(id);
  }

  // Tạo đơn (user)
  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Tạo đơn thuê (USER)" })
  @ApiOkResponse({ type: ApiResponseDto })
  create(@CurrentUser() user: any, @Body() dto: CreateThueCongViecDto) {
    return this.svc.create(Number(user?.id), dto);
  }

  // Cập nhật đơn (admin)
  @Put(":id(\\d+)")
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Cập nhật đơn thuê (ADMIN)" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  updateAdmin(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateThueCongViecDto
  ) {
    return this.svc.updateAdmin(id, dto);
  }

  // Xoá đơn (admin)
  @Delete(":id(\\d+)")
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Xoá đơn thuê (ADMIN)" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  removeAdmin(@Param("id", ParseIntPipe) id: number) {
    return this.svc.removeAdmin(id);
  }

  // Đơn thuê của tôi
  @Get("me/orders")
  @UseGuards(JwtGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Danh sách đơn thuê của tôi" })
  @ApiQuery({ name: "pageIndex", required: false, type: Number })
  @ApiQuery({ name: "pageSize", required: false, type: Number })
  @ApiQuery({ name: "hoanThanh", required: false, type: Boolean })
  @ApiOkResponse({ type: ApiResponseDto })
  myOrders(
    @CurrentUser() user: any,
    @Query("pageIndex") pageIndex?: number,
    @Query("pageSize") pageSize?: number,
    @Query("hoanThanh") hoanThanh?: boolean
  ) {
    const done =
      hoanThanh === undefined
        ? undefined
        : String(hoanThanh).toLowerCase() === "true";
    return this.svc.myOrders(
      Number(user?.id),
      Number(pageIndex),
      Number(pageSize),
      done
    );
  }

  // Hoàn thành đơn (owner hoặc admin)
  @Put(":id(\\d+)/complete")
  @UseGuards(JwtGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Hoàn thành đơn thuê (owner hoặc admin)" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  complete(@CurrentUser() user: any, @Param("id", ParseIntPipe) id: number) {
    return this.svc.complete({ id: Number(user?.id), role: user?.role }, id);
  }
}
