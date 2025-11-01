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
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ResponseInterceptor } from "../../common/response.interceptor";
import { BinhLuanService } from "./binh-luan.service";
import { CreateBinhLuanDto } from "./dto/create-binh-luan.dto";
import { UpdateBinhLuanDto } from "./dto/update-binh-luan.dto";
import { ApiTags } from "@nestjs/swagger";


@UseInterceptors(ResponseInterceptor)
@ApiTags('BinhLuan')
@Controller("binh-luan")
export class BinhLuanController {
  constructor(private readonly service: BinhLuanService) {}

   @Get('theo-cong-viec/:congViecId')
  async findByCongViec(
    @Param('congViecId', ParseIntPipe) congViecId: number,
    @Query('pageIndex') pageIndex?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.findByCongViec(
      congViecId,
      Number(pageIndex) || 1,
      Number(pageSize) || 10,
    );
  }

  @Get()
  async list(
    @Query("pageIndex") pageIndex?: number,
    @Query("pageSize") pageSize?: number,
    @Query("keyword") keyword?: string
  ) {
    return this.service.list(
      Number(pageIndex) || 1,
      Number(pageSize) || 10,
      keyword
    );
  }

  @Get(":id")
  async getById(@Param("id", ParseIntPipe) id: number) {
    return this.service.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBinhLuanDto) {
    return this.service.create(dto);
  }

  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateBinhLuanDto
  ) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
