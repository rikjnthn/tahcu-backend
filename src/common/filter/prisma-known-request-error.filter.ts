import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaKnownRequestErrorFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    if (exception.code === 'P2002') {
      this.handleResponse(response, {
        statusCode: HttpStatus.BAD_REQUEST,
        message: {
          type: 'Duplicate field value',
          meta: exception.meta.target,
        },
      });
    } else if (exception.code === 'P2003') {
      this.handleResponse(response, {
        statusCode: HttpStatus.BAD_REQUEST,
        message: {
          type: 'Foreign key constraint failed',
          meta: exception.meta,
        },
      });
    } else if (exception.code === 'P2023') {
      this.handleResponse(response, {
        statusCode: HttpStatus.BAD_REQUEST,
        message: {
          type: 'Id does not valid',
        },
      });
    } else if (exception.code === 'P2025') {
      this.handleResponse(response, {
        statusCode: HttpStatus.NOT_FOUND,
        message: {
          type: exception.meta.cause,
        },
      });
    } else {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      });
    }
  }

  handleResponse(response: Response, body: ResponseType) {
    response.status(body.statusCode).json(body);
  }
}

interface ResponseType {
  statusCode: number;
  message: {
    type: string | unknown;
    meta?: string[] | unknown;
  };
}
