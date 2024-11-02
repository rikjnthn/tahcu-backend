import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { UserRequest } from '../interface/user-request.interface';

/**
 * Get user data payload from request
 *
 * @returns user data payload
 */
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: UserRequest }>();

    const user = request.user;

    return data ? user?.[data] : user;
  },
);
