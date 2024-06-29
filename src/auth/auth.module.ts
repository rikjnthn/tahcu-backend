import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { EmailModule } from 'src/common/email/email.module';
import { OtpModule } from 'src/common/otp/otp.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRED,
      },
    }),
    PrismaModule,
    EmailModule,
    OtpModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
