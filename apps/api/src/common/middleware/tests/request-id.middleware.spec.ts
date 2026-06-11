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

  it('generates a UUID when no incoming header is present', () => {
    const req = makeReq({});
    const res = makeRes();

    middleware.use(req, res, next);

    const generated = req.headers['x-request-id'];
    expect(typeof generated).toBe('string');
    expect(generated).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});
