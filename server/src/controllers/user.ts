import { RegisterUser, UserModel } from '@src/models/user';
import { IReq, IRes, RouteError } from '@src/types/types';
import HttpStatusCodes from 'constants/http_status_codes';

class UserController {
  static uid = 0;

  private new(params: RegisterUser): UserModel {
    const uuid = `${++UserController.uid}_${Date.now().toString().slice(-8)}`;
    return {
      uuid,
      ...params,
      is_vip: false,
      avatar_url: '',
    };
  }

  async register(req: IReq<{ data: RegisterUser }>, res: IRes): Promise<IRes> {
    const data = this.new(req.body.data);
    try {
      // TODO 查询邮箱是否已注册
      return res.status(HttpStatusCodes.OK).json({ data });
    } catch (error) {
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        '用户注册失败'
      );
    }
  }
}

const controller = new UserController();

export default controller;
