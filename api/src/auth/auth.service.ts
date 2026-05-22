import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(loginDto: LoginAuthDto): Promise<AuthResponseDto> {
    const user = await this.usersService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) throw new ForbiddenException('Invalid credentials');

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      accessToken,
    };
  }

  async register(registerDto: RegisterAuthDto): Promise<AuthResponseDto> {
    const user = await this.usersService.register(registerDto);

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      accessToken,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: any = {};
    if (dto.username) data.username = dto.username;
    if (dto.email) {
      const existing = await this.usersService.findByEmail(dto.email);
      if (existing && existing.id !== userId)
        throw new ForbiddenException('Email already in use');
      data.email = dto.email;
    }
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);
    if (dto.bio !== undefined) data.bio = dto.bio;
    if (dto.country !== undefined) data.country = dto.country;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;

    const updated = await this.usersService['prisma'].user.update({
      where: { id: userId },
      data,
    });

    const { passwordHash, ...rest } = updated as any;
    return rest;
  }

  async profile(userId: string) {
    return await this.usersService.me(userId);
  }

  // ─── Admin ───────────────

  async getAllUsers() {
    const users = await this.usersService['prisma'].user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
        country: true,
        elo: true,
        wins: true,
        losses: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  }

  async updateUserRole(userId: string, dto: UpdateAuthDto) {
    const { role } = dto as Record<string, Role>;
    const allowedRoles: Role[] = [Role.ADMIN, Role.ORGANIZER, Role.USER];

    if (!role || !allowedRoles.includes(role)) {
      throw new BadRequestException(
        'Invalid role. Must be ADMIN, ORGANIZER, or USER.',
      );
    }

    const existing = await this.usersService.findById(userId);
    if (!existing) throw new NotFoundException('User not found');

    const updated = await this.usersService['prisma'].user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
        country: true,
        elo: true,
        wins: true,
        losses: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }
}
