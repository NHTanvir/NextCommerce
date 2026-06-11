import { RequestIdMiddleware } from '../request-id.middleware';

function makeReq(headers: Record<string, string | undefined> = {}) {
  return { headers } as any;
}
function makeRes() {
  return { setHeader: jest.fn() } as any;
}

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new RequestIdMiddleware();
    next = jest.fn();
  });

  it('reuses incoming x-request-id header', () => {
    const req = makeReq({ 'x-request-id': 'incoming-abc' });
    const res = makeRes();

    middleware.use(req, res, next);

    expect(req.headers['x-request-id']).toBe('incoming-abc');
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'incoming-abc');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
