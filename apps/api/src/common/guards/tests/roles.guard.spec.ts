import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from '../roles.guard';
import { ROLES_KEY } from '../../decorators/roles.decorator';

const buildContext = (user: { role?: string } | null, roles: string[]): ExecutionContext =>
  ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext);

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: { getAllAndOverride: jest.fn() },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  it('allows access when no roles required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = buildContext({ role: 'customer' }, []);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows access when user role is in required roles', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const ctx = buildContext({ role: 'admin' }, ['admin']);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('denies access when user role not in required roles', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const ctx = buildContext({ role: 'customer' }, ['admin']);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('denies access when user is null', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const ctx = buildContext(null, ['admin']);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('allows access for multi-role requirement when user matches one', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin', 'staff']);
    const ctx = buildContext({ role: 'staff' }, ['admin', 'staff']);
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
