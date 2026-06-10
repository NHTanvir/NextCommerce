import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import type { User } from '../entities/user.entity';

const mockUser = { id: 'u-1', email: 'user@test.com', name: 'Test User', role: 'user' } as User;

const mockService: Partial<UsersService> = {
  updateProfile: jest.fn().mockResolvedValue({ ...mockUser, name: 'Updated Name' }),
  updatePassword: jest.fn().mockResolvedValue(undefined),
  getAdminStats: jest.fn().mockResolvedValue({ total: 100, admins: 2, newThisMonth: 10 }),
  searchUsers: jest.fn().mockResolvedValue([mockUser]),
  findAll: jest.fn().mockResolvedValue({ data: [mockUser], total: 1 }),
  findById: jest.fn().mockResolvedValue(mockUser),
  update: jest.fn().mockResolvedValue({ ...mockUser, name: 'Admin Updated' }),
  deleteById: jest.fn().mockResolvedValue(undefined),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    }).compile();

    controller = module.get(UsersController);
    jest.clearAllMocks();
  });

  it('getMe() returns the current user', () => {
    expect(controller.getMe(mockUser)).toBe(mockUser);
  });

  it('updateMe() delegates user id and name from dto', async () => {
    await controller.updateMe(mockUser, { name: 'Updated Name' } as any);
    expect(mockService.updateProfile).toHaveBeenCalledWith('u-1', { name: 'Updated Name' });
  });

  it('changePassword() delegates user id and dto fields', async () => {
    const dto = { currentPassword: 'old', newPassword: 'new123' } as any;
    await controller.changePassword(mockUser, dto);
    expect(mockService.updatePassword).toHaveBeenCalledWith('u-1', 'old', 'new123');
  });

  it('getAdminStats() delegates to service', async () => {
    const result = await controller.getAdminStats();
    expect(mockService.getAdminStats).toHaveBeenCalled();
    expect(result).toHaveProperty('total');
  });

  it('searchUsers() caps limit at 50', async () => {
    await controller.searchUsers('alice', 100);
    expect(mockService.searchUsers).toHaveBeenCalledWith('alice', 50);
  });

  it('findAll() caps limit at 100', async () => {
    await controller.findAll(1, 200);
    expect(mockService.findAll).toHaveBeenCalledWith(1, 100);
  });

  it('findOne() delegates id', async () => {
    await controller.findOne('u-1');
    expect(mockService.findById).toHaveBeenCalledWith('u-1');
  });

  it('update() delegates id and dto', async () => {
    const dto = { name: 'Admin Updated' } as any;
    await controller.update('u-1', dto);
    expect(mockService.update).toHaveBeenCalledWith('u-1', dto);
  });

  it('remove() delegates id', async () => {
    await controller.remove('u-1');
    expect(mockService.deleteById).toHaveBeenCalledWith('u-1');
  });
});
