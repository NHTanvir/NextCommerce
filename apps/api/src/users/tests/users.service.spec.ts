import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';

const mockUser = (): User =>
  ({
    id: 'user-uuid-1',
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: null,
    googleId: null,
    role: 'customer',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User);

const mockRepo = () => ({
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      const user = mockUser();
      repo.findOne.mockResolvedValue(user);
      expect(await service.findById('user-uuid-1')).toBe(user);
    });

    it('throws NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('returns null when no user with email', async () => {
      const qb: any = { where: jest.fn().mockReturnThis(), addSelect: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(null) };
      repo.createQueryBuilder.mockReturnValue(qb);
      expect(await service.findByEmail('no@one.com')).toBeNull();
    });

    it('adds passwordHash select when withPassword=true', async () => {
      const user = mockUser();
      const qb: any = { where: jest.fn().mockReturnThis(), addSelect: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(user) };
      repo.createQueryBuilder.mockReturnValue(qb);
      await service.findByEmail('john@example.com', true);
      expect(qb.addSelect).toHaveBeenCalledWith('user.passwordHash');
    });
  });

  describe('create', () => {
    it('throws ConflictException if email already taken', async () => {
      const qb: any = { where: jest.fn().mockReturnThis(), addSelect: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(mockUser()) };
      repo.createQueryBuilder.mockReturnValue(qb);
      repo.findOne.mockResolvedValue(mockUser());
      await expect(service.create({ email: 'john@example.com', name: 'John' })).rejects.toThrow(ConflictException);
    });

    it('creates and returns new user', async () => {
      const qb: any = { where: jest.fn().mockReturnThis(), addSelect: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(null) };
      repo.createQueryBuilder.mockReturnValue(qb);
      repo.findOne.mockResolvedValue(null);
      const user = mockUser();
      repo.create.mockReturnValue(user);
      repo.save.mockResolvedValue(user);
      const result = await service.create({ email: 'new@user.com', name: 'New' });
      expect(result).toBe(user);
    });
  });

  describe('updateProfile', () => {
    it('updates name successfully', async () => {
      const user = mockUser();
      repo.findOne.mockResolvedValue(user);
      repo.save.mockResolvedValue({ ...user, name: 'Jane Doe' });
      const result = await service.updateProfile('user-uuid-1', { name: 'Jane Doe' });
      expect(result.name).toBe('Jane Doe');
    });

    it('throws BadRequestException for empty name', async () => {
      repo.findOne.mockResolvedValue(mockUser());
      await expect(service.updateProfile('user-uuid-1', { name: '   ' })).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for unknown user', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.updateProfile('bad-id', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePassword', () => {
    it('throws BadRequestException if current password is wrong', async () => {
      const user = { ...mockUser(), passwordHash: await bcrypt.hash('correct', 12) };
      const qb: any = { addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(user) };
      repo.createQueryBuilder.mockReturnValue(qb);
      await expect(service.updatePassword('user-uuid-1', 'wrong', 'newpass')).rejects.toThrow(BadRequestException);
    });

    it('updates password when current password is correct', async () => {
      const hash = await bcrypt.hash('correct', 12);
      const user = { ...mockUser(), passwordHash: hash };
      const qb: any = { addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(user) };
      repo.createQueryBuilder.mockReturnValue(qb);
      repo.save.mockResolvedValue(user);
      await expect(service.updatePassword('user-uuid-1', 'correct', 'newpass123')).resolves.not.toThrow();
    });

    it('throws NotFoundException for unknown user', async () => {
      const qb: any = { addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(null) };
      repo.createQueryBuilder.mockReturnValue(qb);
      await expect(service.updatePassword('bad', 'x', 'y')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns paginated users', async () => {
      const users = [mockUser(), mockUser()];
      repo.findAndCount.mockResolvedValue([users, 50]);
      const result = await service.findAll(2, 20);
      expect(result.data).toBe(users);
      expect(result.total).toBe(50);
      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(3);
    });

    it('defaults to page 1 with limit 20', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);
      await service.findAll();
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });

  describe('deleteById', () => {
    it('removes user successfully', async () => {
      const user = mockUser();
      repo.findOne.mockResolvedValue(user);
      repo.remove.mockResolvedValue(undefined);
      await expect(service.deleteById('user-uuid-1')).resolves.not.toThrow();
      expect(repo.remove).toHaveBeenCalledWith(user);
    });

    it('throws NotFoundException if user does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.deleteById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
