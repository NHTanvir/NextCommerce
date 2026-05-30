import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MetricsService } from '../../metrics/metrics.service';
import type { Request, Response } from 'express';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - start) / 1000;
        this.metrics.recordHttpRequest(
          req.method,
          req.route?.path ?? req.path,
          String(res.statusCode),
          duration,
        );
      }),
    );
  }
}
