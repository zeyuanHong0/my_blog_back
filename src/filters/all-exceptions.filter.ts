import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { QueryFailedError } from 'typeorm';

@Catch() // 捕获所有异常（HttpException + 数据库异常 + 其他 Error）
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        if (Array.isArray(r.message)) {
          message = r.message.join('; ');
        } else {
          message = r.message as string;
        }
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = `Database query failed: ${exception.message}`;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      {
        url: request.url,
        method: request.method,
        body: request.body,
        params: request.params,
        query: request.query,
        exception,
      },
      'Unhandled exception',
    );

    response.status(status).json({
      code: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
