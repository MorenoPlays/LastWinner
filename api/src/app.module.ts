import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { jwtConstants } from './auth/jwt/jwtauth.constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { GameModule } from './game/game.module';
import { TournamentModule } from './tournament/tournament.module';
import { TournamentParticipantModule } from './tournament-participant/tournament-participant.module';
import { BracketModule } from './bracket/bracket.module';
import { MatchModule } from './match/match.module';
import { TournamentMessageModule } from './tournament-message/tournament-message.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClipModule } from './clip/clip.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    GameModule,
    TournamentModule,
    TournamentParticipantModule,
    BracketModule,
    MatchModule,
    TournamentMessageModule,
    PostModule,
    CommentModule,
    ClipModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
