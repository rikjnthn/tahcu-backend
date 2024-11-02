import { createHmac, randomBytes } from 'crypto';
import { hash } from 'bcrypt';

import generateCsrfToken from 'src/common/helper/generateCsrfToken';
import hashPassword from '../hash-password';
import validationExceptionFactory from '../validation-exception-factory';
import { BadRequestException } from '@nestjs/common';

jest.mock('crypto', () => {
  return { createHmac: jest.fn(), randomBytes: jest.fn() };
});

jest.mock('bcrypt', () => {
  return {
    genSalt: jest.fn(),
    hash: jest.fn(),
  };
});

describe('helper function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCsrfToken', () => {
    it('should generate CSRF_TOKEN', () => {
      const userSessionId = 'session';
      const hmacGenerated = 'hmacGenerated';
      const message = 'random_64_base_64_string';

      (randomBytes as jest.Mock).mockReturnValue({
        toString: jest.fn().mockReturnValue(message),
      });

      (createHmac as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          digest: jest.fn().mockReturnValue(hmacGenerated),
        }),
      });

      expect(generateCsrfToken(userSessionId)).toEqual(
        `${hmacGenerated}.${userSessionId}!${message}`,
      );
    });
  });

  describe('hashPassword', () => {
    it('should hashed password', async () => {
      (hash as jest.Mock).mockResolvedValue('hashedPassword');

      const hashedPassword = hashPassword('password');

      await expect(hashedPassword).resolves.toEqual('hashedPassword');
    });
  });

  describe('validationExceptionFactory', () => {
    it('should return validation error', () => {
      const error = validationExceptionFactory([
        {
          property: 'email',
          constraints: {
            email: 'error email',
          },
        },
      ]);

      expect(error).toEqual(
        new BadRequestException({
          error: {
            code: 'VALIDATION_ERROR',
            message: {
              email: 'error email',
            },
          },
        }),
      );
    });
  });
});
