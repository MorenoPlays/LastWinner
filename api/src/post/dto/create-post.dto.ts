import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  userId!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  tournamentId?: string;

  @IsOptional()
  @IsString()
  matchId?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;
}
