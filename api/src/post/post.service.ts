import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto) {
    return this.prisma.post.create({
      data: createPostDto,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        likes: true,
        comments: true,
      },
    });
  }

  async findAll() {
    return this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        likes: true,
        comments: true,
      },
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async findByUser(userId: string) {
    return this.prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        likes: true,
        comments: true,
      },
    });
  }

  async findByTournament(tournamentId: string) {
    return this.prisma.post.findMany({
      where: { tournamentId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        likes: true,
        comments: true,
      },
    });
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        likes: true,
        comments: true,
      },
    });
  }

  async remove(id: string) {
    const post = await this.findOne(id);
    if (!post) throw new NotFoundException('Post not found');
    return this.prisma.post.delete({ where: { id } });
  }

  async likePost(postId: string, userId: string) {
    const post = await this.findOne(postId);
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    // If already liked, don't create duplicate
    if (!existing) {
      await this.prisma.postLike.create({
        data: { postId, userId },
      });
    }

    return this.findOne(postId);
  }

  async unlikePost(postId: string, userId: string) {
    const post = await this.findOne(postId);
    if (!post) throw new NotFoundException('Post not found');

    await this.prisma.postLike.delete({
      where: { postId_userId: { postId, userId } },
    }).catch(() => null);

    return this.findOne(postId);
  }
}
