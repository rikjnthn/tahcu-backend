import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { WsException, BaseWsExceptionFilter } from '@nestjs/websockets';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Socket } from 'socket.io';

@Catch(PrismaClientKnownRequestError)
export class PrismaKnownErrorWebsocket extends BaseWsExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToWs();

    const client = ctx.getClient<Socket>();

    if (exception.code === 'P2003') {
      this.handleRespose(client, {
        statusCode: HttpStatus.BAD_REQUEST,
        message: {
          type: exception.message,
          meta: exception.meta,
        },
      });
    } else if (exception.code === 'P2023') {
      this.handleRespose(client, {
        statusCode: HttpStatus.BAD_REQUEST,
        message: {
          type: 'Id does not valid',
        },
      });
    } else if (exception.code === 'P2025') {
      this.handleRespose(client, {
        statusCode: HttpStatus.NOT_FOUND,
        message: {
          type: exception.meta.cause,
        },
      });
    } else {
      super.catch(exception, host);
    }
  }

  handleRespose(client: Socket, response: ResponseType) {
    client.emit('exception', response);
  }
}

interface ResponseType {
  statusCode: number;
  message: {
    type: string | unknown;
    meta?: string[] | unknown;
  };
}
