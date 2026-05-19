import { Injectable, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

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
}
