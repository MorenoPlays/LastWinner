import { RegisterAuthDto } from './register-auth.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
export class AuthResponseDto {
  @IsString()
  id!: string;

  @IsString()
  username!: string;

  @IsString()
  email!: string;

  @IsString()
  role!: string;

  @IsString()
  accessToken!: string;
  
}

export class RegisterResponseDto {
  username!: string;
  email!: string;
  role!: string;
  createdAt!: string;
}
