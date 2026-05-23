import { IsEnum, IsOptional, IsString } from 'class-validator';
export class CreateGameDto {
  @IsString()
  name!: string;
  @IsString()
  slug!: string;
  @IsString()
  coverUrl?: string;
}
