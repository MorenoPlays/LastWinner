import { IsString, IsOptional, IsInt, IsUrl } from 'class-validator';

export class CreateClipDto {
  @IsString()
  userId!: string;

  @IsString()
  gameId!: string;

  @IsString()
  title!: string;

  @IsString()
  videoUrl!: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsInt()
  views?: number;

  @IsOptional()
  @IsInt()
  likes?: number;
}
