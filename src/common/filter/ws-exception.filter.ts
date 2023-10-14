import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(WsException, UnauthorizedException, BadRequestException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const wsException = new WsException(
      (exception as BadRequestException).getResponse(),
    );
    super.catch(wsException, host);
  }
}
