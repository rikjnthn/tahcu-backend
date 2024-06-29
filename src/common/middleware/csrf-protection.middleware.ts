import { HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

import generateCsrfToken from '../helper/generateCsrfToken';

/**
 * Checl if CSRF token is valid
 *
 * @param csrfTokenCookie
 * @param csrfTokenHeader
 *
 * @returns validity of CSRF token
 */
function isCsrfTokenValid(
  csrfTokenCookie?: string,
  csrfTokenHeader?: string,
): boolean {
  if (!csrfTokenCookie || !csrfTokenHeader) return false;

  return csrfTokenCookie === csrfTokenHeader;
}

/**
 * Check if CSRF token is valid. If valid then continue the request and then generate new CSRF token.
 * Otherwise raise BadRequestException error.
 *
 * @param req express request
 * @param res express response
 * @param next express 'next' function
 */
export function csrfProtection(
  req: Request,
  res: Response,
  next: () => void,
): void {
  const csrfTokenCookie = req.cookies.CSRF_TOKEN;
  const csrfTokenHeader = req.headers['x-csrf-token'] as string;

  if (!isCsrfTokenValid(csrfTokenCookie, csrfTokenHeader)) {
    res.status(HttpStatus.BAD_REQUEST).json({
      error: {
        code: 'UNAUTHORIZED',
      },
    });
  } else {
    const CSRF_TOKEN = generateCsrfToken(req.cookies.tahcu_auth);

    res.cookie('CSRF_TOKEN', CSRF_TOKEN, {
      secure: true,
      expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRED)),
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN,
      path: process.env.COOKIE_PATH,
    });

    next();
  }
}
