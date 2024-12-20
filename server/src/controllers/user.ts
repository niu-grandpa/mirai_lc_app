import {
  RegisterUser,
  UpdateUserProfile,
  UserLogin,
  UserModel,
} from '@/models/user';
import { IReq, IReqHeaders, IReqQuery, IRes } from '@/types/types';
import sendSmsByAlicloud from '@libs/alicloud-sms';
import { VerificationCodeModel } from '@models/verification_code';
import {
  encryptByBcrypt,
  handleReqError,
  sendResponse,
  signJwtToken,
  verifyByBcrypt,
  verifyJwtToken,
} from '@util/misc';
import TB_NAME from 'constants/db_table_name';
import HttpStatusCodes from 'constants/http_status_codes';
import RequestErrText from 'constants/request_error_text';
import { useDB } from 'database';
import { customAlphabet } from 'nanoid';

const initUserAccount = 1003640870;

class UserController {
  private _validatePass(password: string): boolean {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/.test(
      password
    );
  }

  register = async (req: IReq<RegisterUser>, res: IRes): Promise<IRes> => {
    try {
      const { code, nickname, password, phoneNumber } = req.body;

      if (!this._isValidPhoneNumber(phoneNumber)) {
        return sendResponse(
          res,
          HttpStatusCodes.BAD_REQUEST,
          RequestErrText.WRONG_PHONE_NUMBER
        );
      }

      if (await this._isUserExists(phoneNumber)) {
        return sendResponse(
          res,
          HttpStatusCodes.BAD_REQUEST,
          RequestErrText.USER_EXISTS
        );
      }

      if (!this._validatePass(password)) {
        return sendResponse(
          res,
          HttpStatusCodes.BAD_REQUEST,
          RequestErrText.PASSWORD_FORMAT_ERR
        );
      }

      if (!(await this._checkVerificationCode(phoneNumber, code))) {
        return sendResponse(
          res,
          HttpStatusCodes.BAD_REQUEST,
          RequestErrText.VERIFICATION_ERROR
        );
      }

      const account = await this._createAccount();
      const hasPassword = await encryptByBcrypt(password);
      const token = signJwtToken({ phoneNumber, account });

      await useDB(
        `INSERT INTO ${TB_NAME.USER} (token, nickname, account, password, phoneNumber) VALUES(?,?,?,?,?)`,
        [token, nickname, account, hasPassword, phoneNumber]
      );

      const user = await this._getUserByToken(token);

      await useDB(
        `INSERT INTO ${TB_NAME.ACCOUNT} (userId, account) VALUES(?,?)`,
        [user!.id, account]
      );

      return sendResponse(res, HttpStatusCodes.OK, user);
    } catch (e) {
      throw handleReqError(e);
    }
  };

  // @ts-ignore
  login = async (req: IReqQuery<UserLogin>, res: IRes): Promise<IRes> => {
    try {
      const { authorization } = req.headers;
      const { account, phoneNumber, password, code } = req.query;

      let resp: string | UserModel = '';
      let statusCode = HttpStatusCodes.OK;

      if (phoneNumber) {
        if (!code) {
          resp = RequestErrText.NOT_VERIFICATION;
          statusCode = HttpStatusCodes.BAD_REQUEST;
        } else {
          if (await this._checkVerificationCode(phoneNumber, code)) {
            const newToken = signJwtToken({ phoneNumber });
            await this._updateUserTokenAndLoginStatusByPhone(
              phoneNumber,
              newToken
            );
            const user = await this._getUserByPhone(phoneNumber);
            if (!user) {
              resp = RequestErrText.NOT_USERS;
              statusCode = HttpStatusCodes.BAD_REQUEST;
            } else {
              resp = user;
            }
          } else {
            resp = RequestErrText.VERIFICATION_ERROR;
            statusCode = HttpStatusCodes.BAD_REQUEST;
          }
        }
      } else if (account) {
        if (!password) {
          resp = RequestErrText.NOT_PASSWORD;
          statusCode = HttpStatusCodes.BAD_REQUEST;
        } else {
          const user = await this._getUserByAccount(account);
          if (!user) {
            resp = RequestErrText.NOT_USERS;
            statusCode = HttpStatusCodes.BAD_REQUEST;
          } else if (await verifyByBcrypt(password, user.password)) {
            const newToken = signJwtToken({ phoneNumber });
            await this._updateUserTokenAndLoginStatus(user.password, newToken);
            user.token = newToken;
            resp = user;
          } else {
            resp = RequestErrText.WRONG_PASSWORD;
            statusCode = HttpStatusCodes.BAD_REQUEST;
          }
        }
      } else if (authorization) {
        try {
          const user = await this._getUserByToken(authorization);
          if (!user) {
            resp = RequestErrText.NOT_USERS;
            statusCode = HttpStatusCodes.UNAUTHORIZED;
          } else {
            await this._updateUserLoginStatus(authorization, true);
            resp = user;
          }
        } catch {
          resp = RequestErrText.LOGIN_EXPIRED;
          statusCode = HttpStatusCodes.UNAUTHORIZED;
        }
      } else {
        resp = RequestErrText.MISSING_PARAMS;
        statusCode = HttpStatusCodes.BAD_REQUEST;
      }

      return sendResponse(res, statusCode, resp);
    } catch (e) {
      throw handleReqError(e);
    }
  };

  logout = async (req: IReq<IReqHeaders>, res: IRes): Promise<IRes> => {
    try {
      const { authorization } = req.headers;
      await this._updateUserLoginStatus(authorization!, false);
      return sendResponse(res, HttpStatusCodes.OK);
    } catch (e) {
      throw handleReqError(e);
    }
  };

  destory = async (
    req: IReqQuery<{ account: string }>,
    res: IRes
  ): Promise<IRes> => {
    try {
      const { account } = req.query;
      await useDB(`DELETE FROM ${TB_NAME.ACCOUNT} WHERE account = (?)`, [
        account,
      ]);
      const result = await useDB(
        `DELETE FROM ${TB_NAME.USER} WHERE account = (?)`,
        [account]
      );
      // @ts-ignore
      if (result.affectedRows > 0) {
        return sendResponse(res, HttpStatusCodes.OK);
      } else {
        return sendResponse(
          res,
          HttpStatusCodes.BAD_REQUEST,
          RequestErrText.NOT_USERS
        );
      }
    } catch (e) {
      throw handleReqError(e);
    }
  };

  updateProfile = async (
    req: IReq<UpdateUserProfile>,
    res: IRes
  ): Promise<IRes> => {
    try {
      const { uid, nickname, avatar } = req.body;
      await useDB(
        `UPDATE ${TB_NAME.USER} SET avatar = (?), nickname = (?) WHERE id = (?)`,
        [avatar, nickname, uid]
      );
      return sendResponse(res, HttpStatusCodes.OK);
    } catch (e) {
      throw handleReqError(e);
    }
  };

  sendVerificationCode = async (
    req: IReq<{ phoneNumber: string }>,
    res: IRes
  ): Promise<IRes> => {
    try {
      const { phoneNumber } = req.body;
      const genRandomCode = customAlphabet('0123456789', 6);
      const code = genRandomCode();

      await sendSmsByAlicloud(phoneNumber, code);
      await useDB(
        `INSERT INTO ${TB_NAME.VEFIF_CODE} (phoneNumber, code) VALUES(?,?)`,
        [phoneNumber, code]
      );

      return sendResponse(res, HttpStatusCodes.OK);
    } catch (e) {
      throw handleReqError(e);
    }
  };

  private async _createAccount(): Promise<string> {
    const [res] = await useDB<{ 'MAX(id)': number }>(
      `SELECT MAX(id) FROM ${TB_NAME.ACCOUNT}`
    );
    return `${initUserAccount + (res['MAX(id)'] ?? 1)}`;
  }

  private async _checkVerificationCode(
    phoneNumber: string,
    code: string
  ): Promise<boolean> {
    const [res] = await useDB<VerificationCodeModel>(
      `SELECT * FROM ${TB_NAME.VEFIF_CODE} WHERE (phoneNumber = (?) AND code = (?))`,
      [phoneNumber, code]
    );
    if (!res) return false;

    const currentTime = Date.now();
    const createAt = new Date(res.createAt).getTime() + 5 * 60 * 1000;
    return createAt > currentTime;
  }

  private async _isUserExists(phoneNumber: string): Promise<boolean> {
    const [rows] = await useDB<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${TB_NAME.USER} WHERE phoneNumber = (?)`,
      [phoneNumber]
    );
    return rows.count > 0;
  }

  private async _getUserByToken(token: string): Promise<UserModel | null> {
    await verifyJwtToken<UserModel>(token);
    const [user] = await useDB<UserModel>(
      `SELECT * FROM ${TB_NAME.USER} WHERE token = (?)`,
      [token]
    );
    return user || null;
  }

  private async _getUserByAccount(account: string): Promise<UserModel | null> {
    const [user] = await useDB<UserModel>(
      `SELECT * FROM ${TB_NAME.USER} WHERE account = (?)`,
      [account ?? '']
    );
    return user || null;
  }

  private async _getUserByPhone(
    phoneNumber: string
  ): Promise<UserModel | null> {
    const [user] = await useDB<UserModel>(
      `SELECT * FROM ${TB_NAME.USER} WHERE phoneNumber = (?)`,
      [phoneNumber]
    );
    return user || null;
  }

  private async _updateUserLoginStatus(
    token: string,
    isLogin: boolean
  ): Promise<void> {
    await useDB(`UPDATE ${TB_NAME.USER} SET isLogin = ? WHERE token = (?)`, [
      isLogin,
      token,
    ]);
  }

  private async _updateUserTokenAndLoginStatus(
    password: string,
    newToken: string
  ): Promise<void> {
    await useDB(
      `UPDATE ${TB_NAME.USER} SET token = (?), isLogin = true WHERE password = (?)`,
      [newToken, password]
    );
  }

  private async _updateUserTokenAndLoginStatusByPhone(
    phoneNumber: string,
    newToken: string
  ): Promise<void> {
    await useDB(
      `UPDATE ${TB_NAME.USER} SET token = (?), isLogin = true WHERE phoneNumber = (?)`,
      [newToken, phoneNumber]
    );
  }

  private _isValidPhoneNumber(phoneNumber: string): boolean {
    return /^1[3-9]\d{9}$/.test(phoneNumber);
  }
}

const controller = new UserController();

export default controller;
