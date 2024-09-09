import { RouteError, type IReq, type IRes } from '@/types/types';
import HttpStatusCodes from 'constants/http_status_codes';
import fs from 'fs-extra';

export class UploadController {
  readJsonFile = async (req: IReq, res: IRes): Promise<IRes> => {
    try {
      const file = req.file;

      if (file?.mimetype !== 'application/json') {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ error: '请上传json文件' });
      }

      const content = fs.readFileSync(file.path, 'utf8');
      fs.remove(file.path);

      return res.status(HttpStatusCodes.OK).json({ data: content });
    } catch (e) {
      throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, e.message);
    }
  };
}

const controller = new UploadController();

export default controller;
