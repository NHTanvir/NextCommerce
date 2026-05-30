import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { UserPayload } from '@nextcommerce/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash: dto.password,
      name: dto.name,
      role: 'customer',
    });

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email, true);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await user.validatePassword(dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

  async googleLogin(googleUser: {
    googleId: string;
    email: string;
    name: string;
  }) {
    let user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (!user) {
      const existing = await this.usersService.findByEmail(googleUser.email);
      if (existing) {
        user = await this.usersService.update(existing.id, {
          googleId: googleUser.googleId,
        });
      } else {
        user = await this.usersService.create({
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.googleId,
          role: 'customer',
        });
      }
    }

    return this.generateToken(user);
  }

  generateToken(user: User) {
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
