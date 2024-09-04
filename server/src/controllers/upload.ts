import { RouteError, type IReq, type IRes } from '@/types/types';
import HttpStatusCodes from 'constants/http_status_codes';

export class UploadController {
  readJsonFile = async (req: IReq, res: IRes): Promise<IRes> => {
    try {
      return res.status(HttpStatusCodes.OK).json({});
    } catch (e) {
      throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, e.message);
    }
  };
}

const controller = new UploadController();

export default controller;
