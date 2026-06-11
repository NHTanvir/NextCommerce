import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';

describe('AuthService.refresh()', () => {
  let service: AuthService;
  const jwt = {
    sign: jest.fn(),
    verify: jest.fn(),
  };
  const users = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwt },
        { provide: UsersService, useValue: users },
      ],
    }).compile();
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('throws Unauthorized when verify() fails', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('expired');
    });

    await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
  });

  it('throws Unauthorized when user no longer exists', async () => {
    jwt.verify.mockReturnValue({ sub: 'u-deleted' });
    users.findById.mockResolvedValue(null);

    await expect(service.refresh('good-token')).rejects.toThrow(UnauthorizedException);
  });

  it('issues a new access_token + refresh_token on valid input', async () => {
    jwt.verify.mockReturnValue({ sub: 'u-1' });
    users.findById.mockResolvedValue({
      id: 'u-1',
      email: 'a@b.c',
      role: 'customer',
      name: 'Alice',
    });
    jwt.sign
      .mockReturnValueOnce('new-access')
      .mockReturnValueOnce('new-refresh');

    const result = await service.refresh('good-token');

    expect(result.access_token).toBe('new-access');
    expect(result.refresh_token).toBe('new-refresh');
    expect(result.user.id).toBe('u-1');
  });
});
