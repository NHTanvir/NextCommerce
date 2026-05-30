import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';
import type { Request } from 'express';

const cache = new Map<string, { data: unknown; expiresAt: number }>();

@Injectable()
export class InMemoryCacheInterceptor implements NestInterceptor {
  constructor(private readonly ttlSeconds: number = 30) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.method !== 'GET') return next.handle();

    const key = `${req.path}?${new URLSearchParams(req.query as Record<string, string>).toString()}`;
    const cached = cache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      return of(cached.data);
    }

    return next.handle().pipe(
      tap((data) => {
        cache.set(key, { data, expiresAt: Date.now() + this.ttlSeconds * 1000 });
      }),
    );
  }
}
