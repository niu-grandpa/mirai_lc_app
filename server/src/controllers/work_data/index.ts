import { IReqQuery, type IReq, type IRes } from '@/types/types';
import { SyncWorkDataReq, WorkDataModel } from '@models/work_data';
import { handleReqError, sendResponse } from '@util/misc';
import TB_NAME from 'constants/db_table_name';
import HttpStatusCodes from 'constants/http_status_codes';
import { useDB } from 'database';
import exportWorkData, { FileExportType } from './share/export';
import TreeDataOptionsController from './tree_data';
import { FolderChildren, FolderNode } from './tree_data/types';

export class WorkDataController extends TreeDataOptionsController {
  getAll = async (
    req: IReqQuery<{ account: string }>,
    res: IRes
  ): Promise<IRes> => {
    try {
      const [data] = await useDB<WorkDataModel>(
        `SELECT * FROM ${TB_NAME.WORK_DATA} WHERE account = (?)`,
        [req.query.account]
      );
      data.saveTime = Number(data.saveTime);
      return sendResponse(res, HttpStatusCodes.OK, data);
    } catch (e) {
      throw handleReqError(e);
    }
  };

  syncData = async (req: IReq<SyncWorkDataReq>, res: IRes): Promise<IRes> => {
    try {
      const { account, data, saveTime } = req.body;
      await useDB(
        `INSERT INTO ${TB_NAME.WORK_DATA} (account, data, saveTime) VALUES (?,?,?) 
         ON DUPLICATE KEY 
            UPDATE data = VALUES(data), saveTime = VALUES(saveTime)`,
        [account, data, String(saveTime)]
      );
      return sendResponse(res, HttpStatusCodes.OK);
    } catch (e) {
      throw handleReqError(e);
    }
  };

  export = async (
    req: IReq<{ data: FolderChildren; fileType: FileExportType }>,
    res: IRes
  ): Promise<IRes> => {
    try {
      const { data, fileType } = req.body;
      const exportFn = exportWorkData(data);

      let link = '';

      if (fileType === 'vue') {
        link = await exportFn.toVue((data as FolderNode).isRoot);
      } else if (fileType === 'json') {
        link = await exportFn.toJson();
      }

      await useDB(
        `INSERT INTO ${TB_NAME.DOWNLOAD} (link) VALUES(?) ON DUPLICATE KEY UPDATE createAt = CURRENT_TIMESTAMP;`,
        [link]
      );
      return sendResponse(res, HttpStatusCodes.OK, link);
    } catch (e) {
      throw handleReqError(e);
    }
  };
}

const controller = new WorkDataController();

export default controller;
