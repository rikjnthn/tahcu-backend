import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import validationExceptionFactory from './common/helper/validation-exception-factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Chat app')
      .setDescription('Chat app backend')
      .setVersion('1.0')
      .addTag('Tahcu')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: validationExceptionFactory,
    }),
  );

  await app.listen(process.env.APP_PORT);
}
bootstrap();
