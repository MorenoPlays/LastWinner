import { IsEnum, IsOptional, isString, IsString } from 'class-validator';

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
