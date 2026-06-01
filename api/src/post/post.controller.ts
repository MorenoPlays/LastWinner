import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.postService.findAll();
  }

  @Get('user/:userId')
  @Public()
  findByUser(@Param('userId') userId: string) {
    return this.postService.findByUser(userId);
  }

  @Get('tournament/:tournamentId')
  @Public()
  findByTournament(@Param('tournamentId') tournamentId: string) {
    return this.postService.findByTournament(tournamentId);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  like(
    @Param('id') id: string,
    @Request() req: Request & { user: { id: string } },
  ) {
    return this.postService.likePost(id, req.user.id);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  unlike(
    @Param('id') id: string,
    @Request() req: Request & { user: { id: string } },
  ) {
    return this.postService.unlikePost(id, req.user.id);
  }
}
