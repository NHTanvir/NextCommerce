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

const REFRESH_SECRET_ENV = 'JWT_REFRESH_SECRET';
const REFRESH_TTL = '30d';

@Injectable()
export class AuthService {
  private readonly refreshSecret: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.refreshSecret =
      process.env[REFRESH_SECRET_ENV] ||
      `${process.env.JWT_SECRET ?? 'fallback-secret'}-refresh`;
  }

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
      refresh_token: this.jwtService.sign(
        { sub: user.id },
        { secret: this.refreshSecret, expiresIn: REFRESH_TTL },
      ),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    let decoded: { sub: string };
    try {
      decoded = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(decoded.sub);
    if (!user) throw new UnauthorizedException('User not found');

    return this.generateToken(user);
  }
}
