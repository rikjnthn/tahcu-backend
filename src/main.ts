import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
      exceptionFactory: (errors) => {
        const errorResponse = errors.map((error) => {
          return {
            [error.property]: Object.values(error.constraints).join(','),
          };
        });

        return new BadRequestException({
          message: Object.assign({}, ...errorResponse),
          error: 'Bad Request',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      },
    }),
  );

  await app.listen(process.env.APP_PORT);
}
bootstrap();
