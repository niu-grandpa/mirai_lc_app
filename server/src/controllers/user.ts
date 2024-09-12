import { GenANodeKey, RegisterUser, UserModel } from '@/models/user';
import { IReq, IRes, RouteError } from '@/types/types';
import HttpStatusCodes from 'constants/http_status_codes';
import logger from 'jet-logger';
import { customAlphabet, nanoid } from 'nanoid';

class UserController {
  static uid = 0;

  private async new(params: RegisterUser): Promise<UserModel> {
    const _nanoid = customAlphabet(params.password, 63);
    const token = `${_nanoid()}${++UserController.uid}`;
    return {
      token,
      ...params,
      is_vip: false,
      avatar_url: '',
    };
  }

  register = async (req: IReq<RegisterUser>, res: IRes): Promise<IRes> => {
    const data = await this.new(req.body);
    try {
      // TODO 查询邮箱是否已注册
      return res.status(HttpStatusCodes.OK).json({ data });
    } catch {
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        '用户注册失败'
      );
    }
  };

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
