import { RouteError, type IReq, type IRes } from '@/types/types';
import { WorkDataModel } from '@models/work_data';
import HttpStatusCodes from 'constants/http_status_codes';
import { useDB } from 'database';

export class WorkDataController {
  getAll = async (req: IReq<{ rootKey: string }>, res: IRes): Promise<IRes> => {
    try {
      const data = await useDB<WorkDataModel>(
        'SELECT * FROM work_data WHERE (userToken = (?) AND rootKey = (?))',
        [req.headers.authorization, req.query.rootKey]
      );
      return res.status(HttpStatusCodes.OK).json({ data });
    } catch (e) {
      throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, e.message);
    }
  };

  syncData = async (
    req: IReq<{ rootKey: string; content: string }>,
    res: IRes
  ): Promise<IRes> => {
    try {
      const {
        rootKey,
        content, // @ts-ignore
        headers: { Authorization },
      } = req.body;

      await useDB(
        `INSERT INTO work_data (rootKey, userToken, content) 
         VALUES (?,?,?) 
         ON DUPLICATE KEY UPDATE 
             userToken = VALUES(userToken), 
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
