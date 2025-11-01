import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ErrorLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;

    // Ghi lại thông tin request
    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);

    res.send = function (body) {
      // Nếu response là lỗi
      if (res.statusCode >= 400) {
        console.error(
          `[ERROR] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`,
        );
        console.error(`Response body:`, body);
      }
      return originalSend.call(this, body);
    };

    next();
  }
}
