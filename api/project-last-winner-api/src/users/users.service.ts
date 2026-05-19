import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterAuthDto } from '../auth/dto/register-auth.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash || '',
    );
    if (!isPasswordValid) return null;
    const { passwordHash, ...result } = user;
    return result;
  }

  async register(registerAuthDto: RegisterAuthDto) {
    const { username, email, password, role } = registerAuthDto;
    if (await this.findByEmail(email))
      throw new Error('Email already registered');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        role: role || 'USER',
      },
    });
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
