import { type IReq, type IRes } from '@/types/types';
import { handleReqError, sendResponse } from '@util/misc';
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
      return sendResponse(res, HttpStatusCodes.OK, content);
    } catch (e) {
      throw handleReqError(e);
    }
  };
}

const controller = new UploadController();

export default controller;
