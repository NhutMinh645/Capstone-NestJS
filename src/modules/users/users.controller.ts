import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { ResponseInterceptor } from '../../common/response.interceptor';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ApiResponseDto } from '../../common/swagger/dtos';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@UseInterceptors(ResponseInterceptor)
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  // ===================== LIST / SEARCH / DETAIL =====================

  @Get()
  @ApiOperation({ summary: 'Danh sách người dùng' })
  @ApiQuery({ name: 'pageIndex', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiOkResponse({ type: ApiResponseDto })
  list(
    @Query('pageIndex') pageIndex?: number,
    @Query('pageSize') pageSize?: number,
    @Query('keyword') keyword?: string,
  ) {
    return this.svc.list(Number(pageIndex), Number(pageSize), keyword);
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm người dùng (phân trang)' })
  @ApiQuery({ name: 'pageIndex', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiOkResponse({ type: ApiResponseDto })
  search(
    @Query('pageIndex') pageIndex?: number,
    @Query('pageSize') pageSize?: number,
    @Query('keyword') keyword?: string,
  ) {
    return this.svc.search(Number(pageIndex), Number(pageSize), keyword);
  }

  @Get(':id(\\d+)')
  @ApiOperation({ summary: 'Chi tiết người dùng' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.svc.detail(id);
  }

  // ===================== ME (PROFILE) =====================

  @Get('me/profile')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Hồ sơ cá nhân (me)' })
  @ApiOkResponse({ type: ApiResponseDto })
  me(@Req() req: any) {
    return this.svc.me(Number(req.user?.id));
  }

  @Put('me/profile')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật hồ sơ (me)' })
  @ApiOkResponse({ type: ApiResponseDto })
  updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    return this.svc.updateMe(Number(req.user?.id), dto);
  }

  // ===================== ADMIN CRUD =====================

  @Post()
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo người dùng (ADMIN)' })
  @ApiOkResponse({ type: ApiResponseDto })
  create(@Body() dto: CreateUserDto) {
    return this.svc.create(dto);
  }

  @Put(':id(\\d+)')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật người dùng (ADMIN)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id(\\d+)')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xoá người dùng (ADMIN)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: ApiResponseDto })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  // ===================== UPLOAD AVATAR (ME) =====================

  @Post('upload-avatar')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload avatar (me)' })
  @ApiOkResponse({ type: ApiResponseDto })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, cb) => {
          const filename = `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(
            file.originalname,
          )}`;
          cb(null, filename);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(jpe?g|png)$/i.test(file.mimetype)) {
          return cb(new BadRequestException('Chỉ chấp nhận .jpg/.jpeg/.png'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new BadRequestException('Missing file');
    const userId = Number(req.user?.id);
    if (!userId) throw new BadRequestException('Không xác định được người dùng');

    const avatarUrl = `/uploads/avatars/${file.filename}`; 
    await this.svc.updateAvatar(userId, avatarUrl);       
    return { message: 'Upload avatar thành công', avatarUrl };
  }
}
