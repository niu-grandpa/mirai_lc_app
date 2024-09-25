import { RouteError, type IReq, type IRes } from '@/types/types';
import { UserModel } from '@models/user';
import { verifyJwtToken } from '@util/misc';
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

    const { exp, phoneNumber } = await verifyJwtToken<UserModel>(authorization);
    const [user] = await useDB<UserModel>(
      'SELECT * FROM users WHERE phoneNumber = (?)',
      [phoneNumber]
    );

    //* 运行非user接口测试时需要注释以下全部判断
    if (!user) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ data: '用户不存在' });
    }

    if (exp && exp < Date.now()) {
      return res
        .status(HttpStatusCodes.UNAUTHORIZED)
        .json({ data: '登录已过期' });
    }

    if (user.token !== authorization) {
      // 判断数据库的token是否需要更新
      const { exp: oldExp } = await verifyJwtToken<UserModel>(authorization);
      if (exp && oldExp && exp > oldExp) {
        await useDB('UPDATE users SET token = (?) WHERE phoneNumber = (?)', [
          authorization,
          phoneNumber,
        ]);
      }
    }

    next();
  } catch (e) {
    throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, '内部错误');
  }
};
