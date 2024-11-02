import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { seconds, ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './common/prisma/prisma.module';
import { csrfProtection } from './common/middleware/csrf-protection.middleware';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MessageModule } from './message/message.module';
import { PrivateChatModule } from './private-chat/private-chat.module';
import { GroupModule } from './group/group.module';
import { EmailModule } from './common/email/email.module';
import { OtpModule } from './common/otp/otp.module';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    MessageModule,
    PrivateChatModule,
    GroupModule,
    ThrottlerModule.forRoot([
      {
        ttl: seconds(parseInt(process.env.DEFAULT_THROTTLER_TTL)),
        limit: parseInt(process.env.DEFAULT_THROTTLER_LIMIT),
      },
    ]),
    EmailModule,
    OtpModule,
    RedisModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(csrfProtection)
      .exclude(
        { path: '/auth/login', method: RequestMethod.POST },
        { path: '/auth/sign-up', method: RequestMethod.POST },
        { path: '/auth/verify-tahcu-token/:token', method: RequestMethod.GET },
        { path: '/auth/send-otp', method: RequestMethod.POST },
      )
      .forRoutes(
        { path: '*', method: RequestMethod.PATCH },
        { path: '*', method: RequestMethod.DELETE },
        { path: '*', method: RequestMethod.POST },
        { path: '*', method: RequestMethod.PUT },
      );
  }
}
