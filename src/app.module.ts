import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, MessageModule],
})
export class AppModule {}
