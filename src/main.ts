import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import validationExceptionFactory from './common/helper/validation-exception-factory';
import { ThrottlerFilter } from './common/filter/throttler.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet(), cookieParser());

  app.enableCors({
    origin: [process.env.ORIGIN_URL],
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    credentials: true,
  });

  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Chat app')
      .setDescription('Chat app backend')
      .setVersion('3.0.8')
      .addTag('Tahcu')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: validationExceptionFactory,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new ThrottlerFilter());

  await app.listen(process.env.APP_PORT);
}
bootstrap();
