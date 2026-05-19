import { RegisterAuthDto } from './register-auth.dto';

export class AuthResponseDto {
  id?: string;
  username?: string;
  email?: string;
  role?: string;
  accessToken?: string;
}

export class RegisterResponseDto {
  username?: string;
  email?: string;
  role?: string;
  createdAt?: string;
}
