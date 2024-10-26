import { IRes, RouteError } from '@/types/types';
import bcrypt from 'bcrypt';
import EnvVars from 'constants/env_vars';
import HttpStatusCodes from 'constants/http_status_codes';
import RequestErrText from 'constants/request_error_text';
import logger from 'jet-logger';
import jwt, { JwtPayload } from 'jsonwebtoken';

/**
 * Miscellaneous shared functions go here.
 */

/**
 * Get a random number between 1 and 1,000,000,000,000
 */
export function getRandomInt(): number {
  return Math.floor(Math.random() * 1_000_000_000_000);
}

/**
 * Wait for a certain number of milliseconds.
 */
export function tick(milliseconds: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}

export function camelToKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export async function encryptByBcrypt(data: string | Buffer): Promise<string> {
  const saltRounds = 10; // 盐的轮数，值越高，计算越复杂
  const hashed = await bcrypt.hash(data, saltRounds);
  return hashed;
}

export async function verifyByBcrypt(
  value: string,
  hashed: string
): Promise<boolean> {
  const match = await bcrypt.compare(value, hashed);
  return match;
}

export function signJwtToken(data: object): string {
  const token = jwt.sign(data, EnvVars.Jwt.Secret, {
    expiresIn: EnvVars.Jwt.Exp,
  });
  return token;
}

export function verifyJwtToken<T = unknown>(
  token: string
): Promise<JwtPayload & T> {
  return new Promise((res, rej) => {
    jwt.verify(token, EnvVars.Jwt.Secret, async (err, decoded) => {
      if (err) {
        return rej(err);
      }
      const data = decoded as JwtPayload & T;
      data.exp = (data.exp ?? 0) * 1000;
      res(data);
    });
  });
}

export function handleReqError(e: Error): RouteError {
  logger.err(e.message);
  return new RouteError(
    HttpStatusCodes.INTERNAL_SERVER_ERROR,
    e.message || RequestErrText.ERROR
  );
}

export function sendResponse(res: IRes, statusCode: number, data?: any): IRes {
  return res.status(statusCode).json({ data: data ?? RequestErrText.OK });
}
