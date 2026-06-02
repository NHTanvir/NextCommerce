import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string, withPassword = false): Promise<User | null> {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .where('user.email = :email', { email });
    if (withPassword) qb.addSelect('user.passwordHash');
    return qb.getOne();
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { googleId } });
  }

  async create(data: Partial<User>): Promise<User> {
    const existing = await this.findByEmail(data.email!);
    if (existing) throw new ConflictException('Email already registered');
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.findById(id);
    await this.userRepo.update(id, data);
    return this.findById(id);
  }

  async updateProfile(id: string, updates: { name?: string }): Promise<User> {
    const user = await this.findById(id);
    if (updates.name !== undefined) {
      if (!updates.name.trim()) throw new BadRequestException('Name cannot be empty');
      user.name = updates.name.trim();
    }
    return this.userRepo.save(user);
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) throw new NotFoundException('User not found');

    if (user.passwordHash) {
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) throw new BadRequestException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepo.save(user);
  }

  async setPassword(id: string, newPassword: string): Promise<void> {
    const hash = await bcrypt.hash(newPassword, 12);
    await this.userRepo.update(id, { passwordHash: hash });
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{ data: User[]; total: number; page: number; totalPages: number }> {
    const [data, total] = await this.userRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async countByRole(role: string): Promise<number> {
    return this.userRepo.count({ where: { role: role as any } });
  }

  async deleteById(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepo.remove(user);
  }
}
