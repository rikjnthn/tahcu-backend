import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createTransport } from 'nodemailer';
import handlebars from 'handlebars';

import { OtpService } from '../otp/otp.service';

@Injectable()
export class EmailService {
  private logger = new Logger(EmailService.name);
  private emailTemplateSource = readFileSync(
    join(__dirname, '..', '..', 'public/email-template.hbs'),
    'utf-8',
  );

  constructor(private otpService: OtpService) {}

  /**
   * Get html template and add dynamic data with handlebars
   *
   * @param templateContext
   *
   * @returns html data
   */
  private async getEmailTemplate(
    templateContext?: Record<string, string | number>,
  ): Promise<string> {
    const template = handlebars.compile(this.emailTemplateSource);

    return template(templateContext);
  }

  /**
   * Send email to the given email address
   *
   * @param email
   */
  async sendEmail(email: string): Promise<void> {
    this.logger.log('Start validating email');

    const otp = await this.otpService.generateOtp(email);

    this.logger.log('Sending email');

    const transporter = createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.sendMail(
      {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Tahcu OTP',
        html: await this.getEmailTemplate({ otp }),
      },
      (err) => {
        if (err) this.logger.warn('Email is not valid');

        this.logger.log('Email sent');
      },
    );
  }
}
