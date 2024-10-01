import { IReqQuery, type IReq, type IRes } from '@/types/types';
import { SyncWorkDataReq, WorkDataModel } from '@models/work_data';
import { handleReqError, sendResponse } from '@util/misc';
import TB_NAME from 'constants/db_table_name';
import HttpStatusCodes from 'constants/http_status_codes';
import { useDB } from 'database';

export class WorkDataController {
  getAll = async (
    req: IReqQuery<{ uid: string }>,
    res: IRes
  ): Promise<IRes> => {
    try {
      const [data] = await useDB<WorkDataModel>(
        `SELECT * FROM ${TB_NAME.WORK_DATA} WHERE userId = (?)`,
        [req.query.uid]
      );
      data.saveTime = Number(data.saveTime);
      return sendResponse(res, HttpStatusCodes.OK, data);
    } catch (e) {
      throw handleReqError(e);
    }
  };

  syncData = async (req: IReq<SyncWorkDataReq>, res: IRes): Promise<IRes> => {
    try {
      const { uid, data, saveTime } = req.body;
      await useDB(
        `INSERT INTO ${TB_NAME.WORK_DATA} (userId, data, saveTime) VALUES (?,?,?) 
         ON DUPLICATE KEY 
            UPDATE data = VALUES(data), saveTime = VALUES(saveTime)`,
        [uid, data, String(saveTime)]
      );
      return sendResponse(res, HttpStatusCodes.OK);
    } catch (e) {
      throw handleReqError(e);
    }
  };
}

const controller = new WorkDataController();

export default controller;
