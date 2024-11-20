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

    this.emitException(exception, client);
  }

  private emitException(errObject: Record<string, any>, client: Socket) {
    client.emit('error', errObject);
  }
}
