import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as cookie from 'cookie';

import { PrismaService } from '../prisma/prisma.service';
import { MessageWsMiddlewareType } from '../interface/message-ws-middleware.interface';

export function messageWs(
  jwtService: JwtService,
  prismaService: PrismaService,
): MessageWsMiddlewareType {
  return async (req, next) => {
    try {
      const tahcu_auth = cookie.parse(
        req.client.request.headers.cookie ?? '',
      ).tahcu_auth;

      if (!tahcu_auth) {
        Logger.warn('JWT token is not served');

        next({
          name: 'UNAUTHORIZED',
          message: 'User token is not valid',
        });

        return;
      }

      Logger.log('Verifying JWT token');

      const payload = jwtService.verify(tahcu_auth, {
        secret: process.env.JWT_SECRET,
      });

      Logger.log('Check if user exist');

      const user = await prismaService.users.findFirst({
        where: { id: payload.id },
      });

      if (!user) {
        Logger.warn('User does not exist');

        next({
          name: 'UNAUTHORIZED',
          message: 'User token is not valid',
        });

        return;
      }

      Logger.log('JWT token verified');

      req.user = {
        user_id: user.user_id,
      };

      next();
    } catch {
      Logger.warn('User not valid');
      next({
        name: 'UNAUTHORIZED',
        message: 'User token is not valid',
      });
    }
  };
}
