import { Module } from '@nestjs/common';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { OtpModule } from 'src/common/otp/otp.module';

@Module({
  imports: [PrismaModule, OtpModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
