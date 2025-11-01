import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response: any = isHttp ? exception.getResponse() : { message: 'Internal server error' };
    const message = typeof response === 'string' ? response : response.message || 'Internal server error';

    res.status(status).json({
      statusCode: status,
      message,
      content: null,
      path: req.url,
      dateTime: new Date().toISOString(),
    });
  }
}
