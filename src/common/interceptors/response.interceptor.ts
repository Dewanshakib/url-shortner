import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SkipResponse } from '../decorator/skip-response.decorator.js';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const skipResponse = this.reflector.get(SkipResponse, context.getHandler());

    if (skipResponse) {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: response.statusCode,
        message: 'Request successful',
        data,
      })),
    );
  }
}
