import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;

@Injectable()
export class SimpleThrottleGuard implements CanActivate {
  private readonly store = new Map<string, { count: number; resetAt: number }>();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const ip: string = req.ip ?? 'unknown';
    const now = Date.now();
    const entry = this.store.get(ip);

    if (!entry || entry.resetAt < now) {
      this.store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
      return true;
    }

    entry.count += 1;
    if (entry.count > MAX_REQUESTS) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}
