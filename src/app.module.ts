import { Module, MiddlewareConsumer,NestModule  } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { LoaiCongViecModule } from "./modules/loai-cong-viec/loai-cong-viec.module";
import { ChiTietLoaiModule } from "./modules/chi-tiet-loai-cong-viec/chi-tiet-loai-cong-viec.module";
import { CongViecModule } from "./modules/cong-viec/cong-viec.module";
import { BinhLuanModule } from "./modules/binh-luan/binh-luan.module";
import { SkillModule } from "./modules/skill/skill.module";
import { ThueCongViecModule } from "./modules/thue-cong-viec/thue-cong-viec.module";
import { ErrorLoggerMiddleware } from "./common/middleware/error-logger.middleware";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

@Module({
  imports: [
    AuthModule,
    UsersModule,
    LoaiCongViecModule,
    ChiTietLoaiModule,
    CongViecModule,
    BinhLuanModule,
    SkillModule,
    ThueCongViecModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ErrorLoggerMiddleware).forRoutes('*');
  }
}