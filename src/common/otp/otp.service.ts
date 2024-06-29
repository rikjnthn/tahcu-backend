import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'crypto';

import { RedisService } from '../redis/redis.service';

@Injectable()
export class OtpService {
  private logger = new Logger(OtpService.name);

  constructor(private redisService: RedisService) {}

  /**
   * Generate otp then set expiry time for fifteen minutes
   *
   * @param email to attach otp to email
   *
   * @returns otp
   */
  async generateOtp(email: string): Promise<string> {
    this.logger.log('Create OTP');

    if (!email) {
      throw new BadRequestException({
        error: {
          code: 'INVALID',
          message: 'The email is not given',
        },
      });
    }

    const fifteenMinutesInSeconds = 900;

    const otp = randomInt(1_000, 9_999);

    await this.redisService.set(email, otp, 'EX', fifteenMinutesInSeconds);

    return String(otp);
  }

  /**
   * Valdate otp
   *
   * @param inputOtp otp input
   * @param email to get otp that has been attached
   *
   * @returns otp validity
   */
  async validateOtp(inputOtp: string, email: string): Promise<boolean> {
    this.logger.log('Start validating otp');

    if (!inputOtp) {
      this.logger.warn('OTP input is not served');

      throw new BadRequestException({
        error: {
          code: 'NOT_GIVEN',
          message: 'The OTP is not served',
        },
      });
    }

    const otp = await this.redisService.get(email);

    if (otp === null) {
      this.logger.warn('The OTP has expired');

      throw new BadRequestException({
        error: {
          code: 'OTP_EXPIRED',
          message: 'The OTP has expired',
        },
      });
    }

    if (otp !== inputOtp) {
      this.logger.log('OTP is not valid');

      throw new BadRequestException({
        error: {
          code: 'INVALID',
          message: 'The OTP is not valid',
        },
      });
    }

    this.logger.log('Delete OTP');

    await this.redisService.del(email);

    this.logger.log('OTP validated');

    return true;
  }
}
