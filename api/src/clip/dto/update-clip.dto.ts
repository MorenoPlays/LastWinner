import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateClipDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

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
