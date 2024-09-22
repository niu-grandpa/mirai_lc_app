import {
  GenANodeKey,
  RegisterUser,
  UpdateUserProfile,
  UserModel,
} from '@/models/user';
import { IReq, IReqHeaders, IReqQuery, IRes, RouteError } from '@/types/types';
import EnvVars from 'constants/env_vars';
import HttpStatusCodes from 'constants/http_status_codes';
import crypto from 'crypto';
import { useDB } from 'database';
import logger from 'jet-logger';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { nanoid } from 'nanoid';

class PasswordUtils {
  // 密钥和初始化向量 (IV)，IV长度为16字节，AES-256需要32字节的密钥
  private algorithm = 'aes-256-cbc';
  private key = Buffer.from(EnvVars.EncryptPwd.Key); // 密钥，32字节
  private iv = Buffer.from(EnvVars.EncryptPwd.Iv); // 初始化向量，16字节

  // 加密函数
  protected encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // 解密函数
  protected decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  protected parse(text: string): string {
    jwt.verify(text, EnvVars.Jwt.Secret, (err, decode) => {
      if (err) return;
      text = this.encrypt((decode as JwtPayload).sub!);
    });
    return text;
  }

  protected stringify(text: string): string {
    return jwt.sign(text, EnvVars.Jwt.Secret, { expiresIn: '1h' });
  }
}

class UserController extends PasswordUtils {
  constructor() {
    super();
  }

  register = async (req: IReq<RegisterUser>, res: IRes): Promise<IRes> => {
    try {
      let { code, nickname, password, phoneNumber } = req.body;

      if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ data: '手机号码格式错误' });
      }

      const [rows] = await useDB<{ count: number }>(
        'SELECT COUNT(*) as count FROM users WHERE phoneNumber = (?)',
        [phoneNumber]
      );
      if (rows.count > 0) {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ data: '该手机号已被注册' });
      }

      // todo 验证码校验

      // 密码token解析和加密。运行测试时需注释掉代码
      password = this.encrypt(this.parse(password));
      await useDB(
        'INSERT INTO users (nickname,password,phoneNumber) VALUES(?,?,?)',
        [nickname, password, phoneNumber]
      );

      const [user] = await useDB<UserModel>(
        'SELECT * FROM users WHERE phoneNumber = (?)',
        [phoneNumber]
      );

      user.password = this.stringify(this.decrypt(user.password));

      const token = this._generateToken(user);
      await useDB('UPDATE users SET token = (?) WHERE phoneNumber = (?)', [
        token,
        phoneNumber,
      ]);

      return res.status(HttpStatusCodes.OK).json({ data: token });
    } catch (e) {
      logger.err(e.message);
      throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, '内部错误');
    }
  };

  private _generateToken(user: UserModel): string {
    const token = jwt.sign(user, EnvVars.Jwt.Secret, {
      expiresIn: EnvVars.Jwt.Exp,
    });
    return token;
  }

  login = async (
    req: IReqQuery<{ phoneNumber: string; password: string }>,
    res: IRes
  ): Promise<IRes> => {
    try {
      const authorization = req.headers.authorization;
      const { phoneNumber, password } = req.query;

      let msg = '';
      let code = HttpStatusCodes.OK;

      if (authorization) {
        const [user] = await useDB<UserModel>(
          'SELECT * FROM users WHERE token = (?)',
          [authorization]
        );
        if (!user) {
          msg = '请重新登录';
          code = HttpStatusCodes.UNAUTHORIZED;
        } else {
          const callback = async (err: any, decoded: any) => {
            if (err) {
              msg = '用户令牌识别失败';
              code = HttpStatusCodes.INTERNAL_SERVER_ERROR;
              return;
            }
            const data = decoded as jwt.JwtPayload;
            if (user.isLogin) {
              msg = '禁止重复登录';
              code = HttpStatusCodes.BAD_REQUEST;
              return;
            }
            if (data.exp! * 1000 <= Date.now()) {
              msg = '登录已过期';
              code = HttpStatusCodes.UNAUTHORIZED;
              return;
            }
            await useDB('UPDATE users SET isLogin = true WHERE token = (?)', [
              authorization,
            ]);
            msg = authorization;
          };
          jwt.verify(authorization, EnvVars.Jwt.Secret, callback);
        }
      } else {
        const [user] = await useDB<UserModel>(
          'SELECT * FROM users WHERE phoneNumber = (?)',
          [phoneNumber]
        );
        if (!user) {
          msg = '该手机号尚未注册';
          code = HttpStatusCodes.BAD_REQUEST;
        } else if (user.isLogin) {
          msg = '禁止重复登录';
          code = HttpStatusCodes.BAD_REQUEST;
        } else if (phoneNumber && password) {
          if (this.parse(password) !== this.decrypt(user.password)) {
            msg = '密码错误';
            code = HttpStatusCodes.BAD_REQUEST;
          } else {
            user.password = password;
            const newToken = this._generateToken(user);
            msg = newToken;
            useDB('UPDATE users SET token = (?) WHERE phoneNumber = (?)', [
              newToken,
              user.phoneNumber,
            ]);
          }
        }
      }

      return res.status(code).json({ data: msg });
    } catch (e) {
      logger.err(e.message);
      throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, '内部错误');
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
      return res.status(HttpStatusCodes.OK).json({ data: 'OK' });
    } catch (e) {
      logger.err(e.message);
      throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, '内部错误');
    }
  };

  destory = async (
    req: IReqQuery<{ phoneNumber: string }>,
    res: IRes
  ): Promise<IRes> => {
    try {
      const result = await useDB(
        'DELETE FROM users WHERE (phoneNumber = (?) AND token = (?))',
        [req.query.phoneNumber, req.headers.authorization]
      );
      // @ts-ignore
      if (result.affectedRows > 0) {
        return res.status(HttpStatusCodes.OK).json({ data: 'OK' });
      }
      return res.status(HttpStatusCodes.BAD_REQUEST).json({ data: '注销失败' });
    } catch (e) {
      logger.err(e.message);
      throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, '内部错误');
    }
  };

  async updateProfile(req: IReq<UpdateUserProfile>, res: IRes): Promise<IRes> {
    try {
      const {
        nickname,
        password,
        avatar,
        headers: { Authorization },
      } = req.body;
      await useDB(
        'UPDATE users SET avatar = (?), nickname = (?), password = (?) WHERE token = (?)',
        [avatar, nickname, this.encrypt(this.parse(password!)), Authorization]
      );
      return res.status(HttpStatusCodes.OK).json({ data: 'OK' });
    } catch (e) {
      logger.err(e.message);
      throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, '内部错误');
    }
  }

  genANodeKey = async (req: IReq<GenANodeKey>, res: IRes): Promise<IRes> => {
    try {
      const { suffix } = req.body;
      const key = `v${nanoid()}${suffix ?? ''}`;
      return res.status(HttpStatusCodes.OK).json({ data: key });
    } catch (e) {
      logger.err(e.message);
      throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, '内部错误');
    }
  };
}

const controller = new UserController();

export default controller;
