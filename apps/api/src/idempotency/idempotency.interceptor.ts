import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ConflictException,
} from '@nestjs/common';
import { Observable, from, of, tap, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IdempotencyService } from './idempotency.service';

const HEADER = 'idempotency-key';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly service: IdempotencyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    const key = (req.headers[HEADER] ?? req.headers[HEADER.toUpperCase()]) as string | undefined;
    if (!key) return next.handle();

    if (!/^[A-Za-z0-9_-]{8,100}$/.test(key)) {
      return throwError(() => new ConflictException('Invalid Idempotency-Key format'));
    }

    const user = req.user as { id?: string; userId?: string; sub?: string } | undefined;
    const userId: string | null = user?.id ?? user?.userId ?? user?.sub ?? null;
    const route = `${req.method} ${req.route?.path ?? req.url}`;

    return from(this.service.find(key)).pipe(
      switchMap((cached) => {
        if (cached) {
          res.status(cached.statusCode);
          res.setHeader('Idempotent-Replay', 'true');
          return of(cached.body);
        }
        return next.handle().pipe(
          tap((body) => {
            const statusCode = res.statusCode ?? 200;
            this.service.store({ key, userId, route, statusCode, body }).catch(() => undefined);
          }),
        );
      }),
    );
  }
}
