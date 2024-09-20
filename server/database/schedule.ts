import { DownloadModel } from '@models/download';
import { useDB } from 'database';
import fs from 'fs-extra';
import logger from 'jet-logger';
import cron from 'node-cron';
import path from 'path';

const MIDNIGHT = '0 0 * * *';

cron.schedule(MIDNIGHT, async () => {
  try {
    const res = await useDB<DownloadModel>(
      'SELECT * FROM download WHERE created_at < NOW() - INTERVAL 1 DAY'
    );

    res.forEach(({ link }) => {
      fs.rmSync(path.resolve(__dirname, `../public${link}`), {
        recursive: true,
      });
    });

    useDB('DELETE FROM download WHERE created_at < NOW() - INTERVAL 1 DAY');

    logger.info('运行定时任务: 删除过期下载文件');
  } catch {
    logger.err('删除过期记录时发生错误');
  }
});
