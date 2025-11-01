import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const res = context.switchToHttp().getResponse();
    return next.handle().pipe(map((content) => ({
      statusCode: res.statusCode,
      message: 'Xử lý thành công!',
      content,
      dateTime: new Date().toISOString(),
    })));
  }
}
