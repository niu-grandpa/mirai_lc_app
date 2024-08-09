import HttpStatusCodes from 'constants/http_status_codes';
import * as e from 'express';
import { Query } from 'express-serve-static-core';

/**
 * Error with status code and message
 */
export class RouteError extends Error {
  public status: HttpStatusCodes;

  public constructor(status: HttpStatusCodes, message: string) {
    super(message);
    this.status = status;
  }
}

export type Immutable<T> = {
  readonly [K in keyof T]: Immutable<T[K]>;
};

// **** Express **** //

export interface IReq<T = void> extends e.Request {
  body: T;
}

export interface IReqQuery<T extends Query, U = void> extends e.Request {
  query: T;
  body: U;
}

export interface IRes extends e.Response {}

export interface GenericPagination {
  page: number;
  size: number;
  /**正倒序 */
  sort?: 1 | -1;
}
