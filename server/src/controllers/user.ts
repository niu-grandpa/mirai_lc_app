import {
  GenANodeKey,
  RegisterUser,
  UpdateUserProfile,
  UserModel,
} from '@/models/user';
import { IReq, IReqHeaders, IReqQuery, IRes, RouteError } from '@/types/types';
import { encryptByBcrypt, signJwtToken, verifyByBcrypt } from '@util/misc';
import HttpStatusCodes from 'constants/http_status_codes';
import RequestErrText from 'constants/request_error_text';
import { useDB } from 'database';
import logger from 'jet-logger';
import { nanoid } from 'nanoid';

class UserController {
  register = async (req: IReq<RegisterUser>, res: IRes): Promise<IRes> => {
    try {
      req.body.password = await encryptByBcrypt(req.body.password);

      const { code, nickname, password, phoneNumber } = req.body;

      if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ data: RequestErrText.WRONG_PHONE_NUMBER });
      }

      const [rows] = await useDB<{ count: number }>(
        'SELECT COUNT(*) as count FROM users WHERE phoneNumber = (?)',
        [phoneNumber]
      );
      if (rows.count > 0) {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ data: RequestErrText.USER_EXISTS });
      }

      // todo 验证码校验

      const token = signJwtToken({ phoneNumber });

      await useDB(
        'INSERT INTO users (token, nickname, password, phoneNumber) VALUES(?,?,?,?)',
        [token, nickname, password, phoneNumber]
      );

      const data = await useDB('SELECT * FROM users WHERE token = (?)', [
        token,
      ]);
      return res.status(HttpStatusCodes.OK).json({ data });
    } catch (e) {
      logger.err(e.message);
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        RequestErrText.ERROR
      );
    }
  };

  login = async (
    req: IReqQuery<{ nickname: string; phoneNumber: string; password: string }>,
    res: IRes
  ): Promise<IRes> => {
    try {
      const { authorization } = req.headers;
      const { nickname, phoneNumber, password } = req.query;

      let resp: string | UserModel = '';
      let code = HttpStatusCodes.OK;

      // token 登录
      if (authorization) {
        const [user] = await useDB<UserModel>(
          'SELECT * FROM users WHERE token = (?)',
          [authorization]
        );
        if (!user) {
          resp = RequestErrText.NOT_USERS;
          code = HttpStatusCodes.UNAUTHORIZED;
        } else if (user.isLogin) {
          resp = RequestErrText.REPEAT_LOGIN;
          code = HttpStatusCodes.BAD_REQUEST;
        } else {
          await useDB(
            'UPDATE users SET isLogin = true WHERE phoneNumber = (?)',
            [user.phoneNumber]
          );
          resp = user;
        }
      } else if ((nickname || phoneNumber) && password) {
        const [user] = await useDB<UserModel>(
          'SELECT * FROM users WHERE (phoneNumber = (?) OR nickname = (?))',
          [phoneNumber ?? '', nickname ?? '']
        );
        if (!user) {
          resp = RequestErrText.NOT_USERS;
          code = HttpStatusCodes.BAD_REQUEST;
        } else if (user.isLogin) {
          resp = RequestErrText.REPEAT_LOGIN;
          code = HttpStatusCodes.BAD_REQUEST;
        } else if (phoneNumber && password) {
          if (await verifyByBcrypt(password, user.password)) {
            const newToken = signJwtToken({ phoneNumber });
            await useDB(
              'UPDATE users SET token = (?) WHERE phoneNumber = (?)',
              [newToken, user.phoneNumber]
            );
            user.token = newToken;
            resp = user;
          } else {
            resp = RequestErrText.WRONG_PASSWORD;
            code = HttpStatusCodes.BAD_REQUEST;
          }
        }
      } else {
        resp = RequestErrText.MISSING_PARAMS;
        code = HttpStatusCodes.BAD_REQUEST;
      }

      return res.status(code).json({ data: resp });
    } catch (e) {
      logger.err(e.message);
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        RequestErrText.ERROR
      );
    }
  };

  logout = async (req: IReq<IReqHeaders>, res: IRes): Promise<IRes> => {
    try {
      const {
        headers: { Authorization },
      } = req.body;
      await useDB('UPDATE users SET isLogin = false WHERE token = (?)', [
        Authorization,
      ]);
      return res.status(HttpStatusCodes.OK).json({ data: RequestErrText.OK });
    } catch (e) {
      logger.err(e.message);
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        RequestErrText.ERROR
      );
    }
  };

  destory = async (
    req: IReqQuery<{ uid: string; phoneNumber: string }>,
    res: IRes
  ): Promise<IRes> => {
    try {
      const result = await useDB(
        'DELETE FROM users WHERE (id = (?) AND phoneNumber = (?))',
        [req.query.uid, req.query.phoneNumber]
      );
      // @ts-ignore
      if (result.affectedRows > 0) {
        return res.status(HttpStatusCodes.OK).json({ data: RequestErrText.OK });
      }
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ data: RequestErrText.NOT_USERS });
    } catch (e) {
      logger.err(e.message);
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        RequestErrText.ERROR
      );
    }
  };

  async updateProfile(req: IReq<UpdateUserProfile>, res: IRes): Promise<IRes> {
    try {
      const { uid, nickname, password, avatar, newPassword } = req.body;
      // todo 手机号&密码修改
      await useDB(
        'UPDATE users SET avatar = (?), nickname = (?) WHERE id = (?)',
        [avatar, nickname, uid]
      );
      return res.status(HttpStatusCodes.OK).json({ data: RequestErrText.OK });
    } catch (e) {
      logger.err(e.message);
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        RequestErrText.ERROR
      );
    }
  }

  genANodeKey = async (req: IReq<GenANodeKey>, res: IRes): Promise<IRes> => {
    try {
      const { suffix } = req.body;
      const key = `v${nanoid()}${suffix ?? ''}`;
      return res.status(HttpStatusCodes.OK).json({ data: key });
    } catch (e) {
      logger.err(e.message);
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        RequestErrText.ERROR
      );
    }
  };
}

const controller = new UserController();

export default controller;
