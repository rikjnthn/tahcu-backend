import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionFilter {
  catch(
    exception: WsException | UnauthorizedException | BadRequestException,
    host: ArgumentsHost,
  ) {
    const client = host.switchToWs().getClient<Socket>();

    if (exception instanceof BadRequestException) {
      this.emitException(exception.getResponse(), client);
    } else if (exception instanceof UnauthorizedException) {
      this.emitException(exception.getResponse(), client);
    } else if (exception instanceof WsException) {
      this.emitException(exception.getError(), client);
    }
  }

  private emitException(
    errObject: string | Record<string, any>,
    client: Socket,
  ) {
    client.emit('error', errObject);
  }
}
