import { Module } from '@nestjs/common';

import { EmailService } from './email.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [PrismaModule, OtpModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
