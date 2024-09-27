import { RouteError, type IReq, type IRes } from '@/types/types';
import HttpStatusCodes from 'constants/http_status_codes';
import RequestErrText from 'constants/request_error_text';
import fs from 'fs-extra';

export class UploadController {
  readJsonFile = async (req: IReq, res: IRes): Promise<IRes> => {
    try {
      const file = req.file;

      if (file?.mimetype !== 'application/json') {
        return res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ data: RequestErrText.MUST_JSON_FILE });
      }

      const content = fs.readFileSync(file.path, 'utf8');
      fs.remove(file.path);

      return res.status(HttpStatusCodes.OK).json({ data: content });
    } catch (e) {
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        RequestErrText.ERROR
      );
    }
  };
}

const controller = new UploadController();

export default controller;
