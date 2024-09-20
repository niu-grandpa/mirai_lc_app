import { RouteError, type IReq, type IRes } from '@/types/types';
import HttpStatusCodes from 'constants/http_status_codes';
import { useDB } from 'database';
import { NextFunction } from 'express';

export const authenticateUser = async <T>(
  req: IReq<T>,
  res: IRes,
  next: NextFunction
) => {
  try {
    const authorization =
      // @ts-ignore
      req.headers.authorization || req.body.headers.Authorization;

    if (!authorization) {
      return res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json({ data: '请先登录' });
    }

    const [user] = await useDB('SELECT * FROM users WHERE token=(?)', [
      authorization,
    ]);
    //! 运行测试时需要注释以下判断逻辑
    if (!user) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ data: '用户不存在' });
    }

    next();
  } catch (e) {
    throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, e.message);
  }
};
