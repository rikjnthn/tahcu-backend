import { Logger } from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';

/**
 * Hashed password using bcrypt
 *
 * @param password password that need to be hashed
 *
 * @returns hashed password
 */
export default async function hashPassword(password: string): Promise<string> {
  Logger.log('Start hashing password');

  const saltRounds = 10;
  const generatedSalt = await genSalt(saltRounds);
  const hashedPassword = await hash(password, generatedSalt);

  return hashedPassword;
}
