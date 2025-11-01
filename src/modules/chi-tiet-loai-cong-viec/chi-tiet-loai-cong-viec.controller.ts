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
  UploadedFile,
} from '@nestjs/common';
import { ResponseInterceptor } from '../../common/response.interceptor';
import { ChiTietLoaiService } from './chi-tiet-loai-cong-viec.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/swagger/dtos';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateChiTietLoaiDto } from './dto/create-chi-tiet-loai.dto.ts';
import { UpdateChiTietLoaiDto } from './dto/update-chi-tiet-loai.dto';

@UseInterceptors(ResponseInterceptor)
@ApiTags('ChiTietLoaiCongViec')
@Controller('chi-tiet-loai-cong-viec')
export class ChiTietLoaiController {
  constructor(private svc: ChiTietLoaiService) {}

  // Danh sách (phân trang + keyword)
  @Get()
  @ApiOperation({ summary: 'Danh sách chi tiết loại' })
  @ApiQuery({ name: 'pageIndex', required: false, type: Number })
  @ApiQuery({ name: 'pageSize',  required: false, type: Number })
  @ApiQuery({ name: 'keyword',   required: false })
  @ApiOkResponse({ type: ApiResponseDto })
  list(
    @Query('pageIndex') pageIndex?: number,
    @Query('pageSize') pageSize?: number,
    @Query('keyword') keyword?: string,
  ) {
    return this.svc.list(Number(pageIndex), Number(pageSize), keyword);
  }

  // Tìm kiếm (alias)
  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm chi tiết loại (phân trang)' })
  @ApiQuery({ name: 'pageIndex', required: false, type: Number })
  @ApiQuery({ name: 'pageSize',  required: false, type: Number })
  @ApiQuery({ name: 'keyword',   required: false })
  @ApiOkResponse({ type: ApiResponseDto })
  search(
    @Query('pageIndex') pageIndex?: number,
    @Query('pageSize') pageSize?: number,
    @Query('keyword') keyword?: string,
  ) {
    return this.svc.search(Number(pageIndex), Number(pageSize), keyword);
  }

  // Danh sách theo loại công việc
  @Get('theo-loai/:loaiId(\\d+)')
  @ApiOperation({ summary: 'Danh sách chi tiết loại theo loaiCongViecId' })
  @ApiParam({ name: 'loaiId', type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  byLoai(@Param('loaiId', ParseIntPipe) loaiId: number) {
    return this.svc.getChiTietTheoLoai(loaiId);
  }

  // Chi tiết
  @Get(':id(\\d+)')
  @ApiOperation({ summary: 'Chi tiết chi tiết loại' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.svc.detail(id);
  }

  // Tạo (ADMIN)
  @Post()
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo chi tiết loại (ADMIN)' })
  @ApiOkResponse({ type: ApiResponseDto })
  create(@Body() dto: CreateChiTietLoaiDto) {
    return this.svc.create(dto);
  }

  // Cập nhật (ADMIN)
  @Put(':id(\\d+)')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật chi tiết loại (ADMIN)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateChiTietLoaiDto) {
    return this.svc.update(id, dto);
  }

  // Xoá (ADMIN)
  @Delete(':id(\\d+)')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xoá chi tiết loại (ADMIN)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  // ====== 3 endpoint "nhóm ..." giữ mock an toàn (đúng path yêu cầu) ======
  @Post('them-nhom-chi-tiet-loai')
  @ApiOperation({ summary: '[MOCK] Thêm nhóm chi tiết loại' })
  @ApiOkResponse({ type: ApiResponseDto })
  createGroup(@Body() body: any) {
    return this.svc.createGroup(body);
  }

  @Post('upload-hinh-nhom-chi-tiet-loai/:maNhom(\\d+)')
  @UseInterceptors(FileInterceptor('formFile'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '[MOCK] Upload hình nhóm chi tiết loại' })
  @ApiParam({ name: 'maNhom', type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  uploadForGroup(@Param('maNhom', ParseIntPipe) maNhom: number, @UploadedFile() file?: Express.Multer.File) {
    return this.svc.uploadForGroup(maNhom, file);
  }

  @Put('sua-nhom-chi-tiet-loai/:id(\\d+)')
  @ApiOperation({ summary: '[MOCK] Sửa nhóm chi tiết loại' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  updateGroup(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.svc.updateGroup(id, body);
  }
}
