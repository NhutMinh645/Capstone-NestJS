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
import { SkillService } from "./skill.service";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { JwtGuard } from "../../common/guards/jwt.guard";
import { AdminGuard } from "../../common/guards/admin.guard";
import { ApiResponseDto } from "../../common/swagger/dtos";
import { CreateSkillDto } from "./dto/create-skill.dto";
import { UpdateSkillDto } from "./dto/update-skill.dto";

@UseInterceptors(ResponseInterceptor)
@ApiTags("Skill")
@Controller("skill")
export class SkillController {
  constructor(private svc: SkillService) {}

  @Get()
  @ApiOperation({ summary: "Danh sách skill" })
  @ApiOkResponse({ type: ApiResponseDto })
  list() {
    return this.svc.list();
  }

  @Get(":id(\\d+)")
  @ApiOperation({ summary: "Chi tiết skill" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  detail(@Param("id", ParseIntPipe) id: number) {
    return this.svc.detail(id);
  }

  @Get("search")
  @ApiOperation({ summary: "Tìm kiếm skill (có phân trang)" })
  @ApiQuery({ name: "keyword", required: false })
  @ApiQuery({ name: "pageIndex", required: false, type: Number })
  @ApiQuery({ name: "pageSize", required: false, type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  search(
    @Query("pageIndex") pageIndex?: number,
    @Query("pageSize") pageSize?: number,
    @Query("keyword") keyword?: string
  ) {
    return this.svc.searchPagination(
      Number(pageIndex),
      Number(pageSize),
      keyword
    );
  }

  @Post()
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Tạo skill (ADMIN)" })
  @ApiOkResponse({ type: ApiResponseDto })
  create(@Body() dto: CreateSkillDto) {
    return this.svc.create(dto);
  }

  @Put(":id(\\d+)")
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Cập nhật skill (ADMIN)" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateSkillDto) {
    return this.svc.update(id, dto);
  }

  @Delete(":id(\\d+)")
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Xóa skill (ADMIN)" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
