import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

 
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

   
    let responseBody: any = {
      statusCode: status,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: (request as any)?.url,
      method: (request as any)?.method,
    };

    
    if (exception instanceof HttpException) {
      const res = exception.getResponse() as any;
      responseBody.message =
        (typeof res === 'string' && res) ||
        res?.message ||
        exception.message ||
        responseBody.message;
      if (res?.error) responseBody.error = res.error;
      if (res?.details) responseBody.details = res.details;
    }

   
    console.error('[EXCEPTION] ================================');
    console.error('Request:', (request as any)?.method, (request as any)?.url);
    console.error('Status :', status);
    if (exception instanceof Error) {
      console.error('Name   :', exception.name);
      console.error('Message:', exception.message);
      console.error('Stack  :', exception.stack);
    } else {
      console.error('Raw exception:', exception);
    }
    console.error('===========================================');

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}
