import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = process.env.DATABASE_URL || '';
    console.log(
      '[PrismaService] DATABASE_URL:',
      connectionString.slice(0, 40) + '...',
    );
    super({
      adapter: new PrismaPg({
        connectionString,
      }),
    });
  }
}
