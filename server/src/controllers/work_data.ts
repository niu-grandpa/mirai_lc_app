import { RouteError, type IReq, type IRes } from '@/types/types';
import { SyncWorkDataReq, WorkDataModel } from '@models/work_data';
import HttpStatusCodes from 'constants/http_status_codes';
import { useDB } from 'database';

export class WorkDataController {
  getAll = async (req: IReq, res: IRes): Promise<IRes> => {
    try {
      const data = await useDB<WorkDataModel>(
        'SELECT * FROM work_data WHERE userToken = (?)',
        [req.headers.authorization]
      );
      return res.status(HttpStatusCodes.OK).json({ data });
    } catch (e) {
      throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, e.message);
    }
  };

  syncData = async (req: IReq<SyncWorkDataReq>, res: IRes): Promise<IRes> => {
    try {
      const {
        rootKey,
        content,
        headers: { Authorization },
      } = req.body;

      await useDB(
        `INSERT INTO work_data (rootKey, userToken, content) 
         VALUES (?,?,?) 
         ON DUPLICATE KEY UPDATE 
             content = VALUES(content)`,
        [rootKey, Authorization, content]
      );

      return res.status(HttpStatusCodes.OK).json({});
    } catch (e) {
      throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, e.message);
    }
  };
}

const controller = new WorkDataController();

export default controller;
