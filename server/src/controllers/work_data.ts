import { IReqQuery, RouteError, type IReq, type IRes } from '@/types/types';
import { SyncWorkDataReq, WorkDataModel } from '@models/work_data';
import HttpStatusCodes from 'constants/http_status_codes';
import { useDB } from 'database';

export class WorkDataController {
  getAll = async (
    req: IReqQuery<{ uid: string }>,
    res: IRes
  ): Promise<IRes> => {
    try {
      const [data] = await useDB<WorkDataModel>(
        'SELECT * FROM work_data WHERE userId = (?)',
        [req.query.uid]
      );
      data.saveTime = Number(data.saveTime);
      return res.status(HttpStatusCodes.OK).json({ data });
    } catch (e) {
      throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, e.message);
    }
  };

  syncData = async (req: IReq<SyncWorkDataReq>, res: IRes): Promise<IRes> => {
    try {
      const { uid, data, saveTime } = req.body;
      await useDB(
        `INSERT INTO work_data (userId, data, saveTime) VALUES (?,?,?) 
         ON DUPLICATE KEY 
            UPDATE data = VALUES(data), saveTime = VALUES(saveTime)`,
        [uid, data, String(saveTime)]
      );
      return res.status(HttpStatusCodes.OK).json({ data: 'OK' });
    } catch (e) {
      throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, e.message);
    }
  };
}

const controller = new WorkDataController();

export default controller;
