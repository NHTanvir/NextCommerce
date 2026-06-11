import { ExecutionContext, CallHandler, ConflictException } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { IdempotencyInterceptor } from '../idempotency.interceptor';

function makeContext(headers: Record<string, string>, user?: any, method = 'POST', url = '/orders') {
  const res = {
    statusCode: 200,
    setHeader: jest.fn(),
    status: jest.fn(),
  };
  const req = {
    headers,
    user,
    method,
    url,
    route: { path: url },
  };
  const ctx = {
    switchToHttp: () => ({
      getRequest: () => req,
      getResponse: () => res,
    }),
  } as unknown as ExecutionContext;
  return { ctx, req, res };
}

function makeHandler(body: unknown): CallHandler {
  return { handle: jest.fn().mockReturnValue(of(body)) };
}

describe('IdempotencyInterceptor', () => {
  const service = {
    find: jest.fn(),
    store: jest.fn(),
  };
  let interceptor: IdempotencyInterceptor;

  beforeEach(() => {
    interceptor = new IdempotencyInterceptor(service as any);
    jest.clearAllMocks();
  });

  it('passes through when no Idempotency-Key header present', async () => {
    const { ctx } = makeContext({});
    const handler = makeHandler({ id: 'o-1' });
    const result = await firstValueFrom(interceptor.intercept(ctx, handler) as any);
    expect(result).toEqual({ id: 'o-1' });
    expect(service.find).not.toHaveBeenCalled();
    expect(service.store).not.toHaveBeenCalled();
  });

  it('throws ConflictException on malformed key', async () => {
    const { ctx } = makeContext({ 'idempotency-key': 'short' });
    const handler = makeHandler({ id: 'o-1' });
    await expect(
      firstValueFrom(interceptor.intercept(ctx, handler) as any),
    ).rejects.toThrow(ConflictException);
  });

  it('replays cached response and sets Idempotent-Replay header', async () => {
    service.find.mockResolvedValue({ statusCode: 201, body: { id: 'cached' } });
    const { ctx, res } = makeContext({ 'idempotency-key': 'abcdef123456' });
    const handler = makeHandler({ id: 'fresh' });
    const result = await firstValueFrom(interceptor.intercept(ctx, handler) as any);
    expect(result).toEqual({ id: 'cached' });
    expect(handler.handle).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.setHeader).toHaveBeenCalledWith('Idempotent-Replay', 'true');
  });
});
