import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ResponseInterceptor } from '../../common/response.interceptor';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/swagger/dtos';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@UseInterceptors(ResponseInterceptor)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private svc: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Đăng ký' })
  @ApiOkResponse({ type: ApiResponseDto })
  signup(@Body() dto: SignupDto) {
    return this.svc.signup(dto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiOkResponse({ type: ApiResponseDto })
  signin(@Body() dto: SigninDto) {
    return this.svc.signin(dto);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Thông tin người dùng từ token' })
  @ApiOkResponse({ type: ApiResponseDto })
  me(@CurrentUser() user: any) {
    return this.svc.me(Number(user?.id));
  }
}
