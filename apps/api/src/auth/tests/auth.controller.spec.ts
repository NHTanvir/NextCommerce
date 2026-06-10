import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import type { UserPayload } from '@nextcommerce/shared';

const mockService: Partial<AuthService> = {
  register: jest.fn().mockResolvedValue({ access_token: 'tok-new', user: { id: 'u-1', email: 'new@test.com', role: 'user' } }),
  login: jest.fn().mockResolvedValue({ access_token: 'tok-login', user: { id: 'u-2', email: 'user@test.com', role: 'user' } }),
  googleLogin: jest.fn().mockResolvedValue({ access_token: 'tok-google' }),
};

const mockUser: UserPayload = { sub: 'u-1', email: 'user@test.com', role: 'user' };

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    }).compile();

    controller = module.get(AuthController);
    jest.clearAllMocks();
  });

  it('register() delegates dto to authService.register', async () => {
    const dto = { email: 'new@test.com', password: 'pass123', name: 'New User' } as any;
    const result = await controller.register(dto);
    expect(mockService.register).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('access_token');
  });

  it('login() delegates dto to authService.login', async () => {
    const dto = { email: 'user@test.com', password: 'pass123' } as any;
    const result = await controller.login(dto);
    expect(mockService.login).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('access_token');
  });

  it('profile() returns the current user payload', () => {
    const result = controller.profile(mockUser);
    expect(result).toBe(mockUser);
  });

  it('googleCallback() calls googleLogin with req.user and redirects', async () => {
    const mockReq = { user: { googleId: 'g-1', email: 'g@test.com', name: 'Google User' } } as any;
    const mockRes = { redirect: jest.fn() } as any;
    await controller.googleCallback(mockReq, mockRes);
    expect(mockService.googleLogin).toHaveBeenCalledWith(mockReq.user);
    expect(mockRes.redirect).toHaveBeenCalledWith(expect.stringContaining('tok-google'));
  });
});
