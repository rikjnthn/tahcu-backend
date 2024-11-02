import { PickType } from '@nestjs/mapped-types';

import { SendOTPDto } from './send-otp.dto';

export class SendResetPasswordOTPDto extends PickType(SendOTPDto, ['email']) {}
