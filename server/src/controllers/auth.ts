import { type IReq, type IRes } from '@/types/types';
import { UserModel } from '@models/user';
import { handleReqError, sendResponse, verifyJwtToken } from '@util/misc';
import TB_NAME from 'constants/db_table_name';
import HttpStatusCodes from 'constants/http_status_codes';
import RequestErrText from 'constants/request_error_text';
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
      return sendResponse(
        res,
        HttpStatusCodes.UNAUTHORIZED,
        RequestErrText.NOT_LOGGED_IN
      );
    }

    const { exp, account } = await verifyJwtToken<UserModel>(authorization);
    const [user] = await useDB<UserModel>(
      `SELECT * FROM ${TB_NAME.USER} WHERE account = (?)`,
      [account]
    );

    //* 运行非user接口测试时需要注释以下全部判断
    if (!user) {
      return sendResponse(
        res,
        HttpStatusCodes.BAD_REQUEST,
        RequestErrText.NOT_USERS
      );
    }

    if (exp && exp < Date.now()) {
      return sendResponse(
        res,
        HttpStatusCodes.UNAUTHORIZED,
        RequestErrText.LOGIN_EXPIRED
      );
    }

    if (user.token !== authorization) {
      // 判断数据库的token是否需要更新
      const { exp: oldExp } = await verifyJwtToken<UserModel>(authorization);
      if (exp && oldExp && exp > oldExp) {
        await useDB(
          `UPDATE ${TB_NAME.USER} SET token = (?) WHERE account = (?)`,
          [authorization, account]
        );
      }
    }

    next();
  } catch (e) {
    throw handleReqError(e);
  }
};
