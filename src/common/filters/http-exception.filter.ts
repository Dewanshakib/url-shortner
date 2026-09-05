import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const errorResponse = exceptionResponse as {
          message?: string | string[];
        };

        message = Array.isArray(errorResponse.message)
          ? errorResponse.message.join(', ')
          : (errorResponse.message ?? message);
      }
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  }
}
