import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Socket } from 'socket.io';

@Catch(PrismaClientKnownRequestError)
export class PrismaKnownErrorWebsocket implements ExceptionFilter {
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
    } else {
      throw new WsException('Bad request');
    }
  }

  handleRespose(client: Socket, response: ResponseType) {
    client.emit('error', response);
  }
}

interface ResponseType {
  statusCode: number;
  message: {
    type: string | unknown;
    meta?: string[] | unknown;
  };
}
