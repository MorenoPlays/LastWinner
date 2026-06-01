import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: createCommentDto,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        likes: true,
      },
    });
  }

  async findAll() {
    return this.prisma.comment.findMany({
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
      },
    });
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({
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
      },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async findByPost(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
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
      },
    });
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.findOne(id);
    if (!comment) throw new NotFoundException('Comment not found');

    return this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        likes: true,
      },
    });
  }

  async remove(id: string) {
    const comment = await this.findOne(id);
    if (!comment) throw new NotFoundException('Comment not found');
    return this.prisma.comment.delete({ where: { id } });
  }

  async likeComment(commentId: string, userId: string) {
    const comment = await this.findOne(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const existing = await this.prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });

    if (existing) {
      await this.prisma.commentLike.delete({
        where: { commentId_userId: { commentId, userId } },
      });
    } else {
      await this.prisma.commentLike.create({
        data: { commentId, userId },
      });
    }

    return this.findOne(commentId);
  }

  async unlikeComment(commentId: string, userId: string) {
    const comment = await this.findOne(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    await this.prisma.commentLike.delete({
      where: { commentId_userId: { commentId, userId } },
    }).catch(() => null);

    return this.findOne(commentId);
  }
}
