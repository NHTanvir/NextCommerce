import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

const mockUsersService = {
  findByEmail: jest.fn(),
  findByGoogleId: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('test.jwt.token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      await expect(service.login({ email: 'x@x.com', password: 'pw' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for wrong password', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'x@x.com',
        validatePassword: jest.fn().mockResolvedValue(false),
        role: 'customer',
        name: 'Test',
      });
      await expect(service.login({ email: 'x@x.com', password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns token on valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'x@x.com',
        name: 'Test User',
        role: 'customer',
        validatePassword: jest.fn().mockResolvedValue(true),
      });
      const result = await service.login({ email: 'x@x.com', password: 'correct' });
      expect(result.access_token).toBe('test.jwt.token');
      expect(result.user.email).toBe('x@x.com');
    });
  });

  describe('generateToken', () => {
    it('signs payload and returns access_token', () => {
      const result = service.generateToken({
        id: 'u1',
        email: 'e@e.com',
        name: 'N',
        role: 'customer',
      } as any);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'u1',
        email: 'e@e.com',
        name: 'N',
        role: 'customer',
      });
      expect(result.access_token).toBe('test.jwt.token');
    });
  });
});
