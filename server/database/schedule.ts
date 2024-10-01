import { DownloadModel } from '@models/download';
import TB_NAME from 'constants/db_table_name';
import { useDB } from 'database';
import fs from 'fs-extra';
import logger from 'jet-logger';
import cron from 'node-cron';
import path from 'path';

const MIDNIGHT = '0 0 * * *';

const cleanupDownloadedFiles = async () => {
  try {
    const res = await useDB<DownloadModel>(
      `SELECT * FROM ${TB_NAME.DOWNLOAD} WHERE createAt < NOW() - INTERVAL 1 DAY`
    );
    res.forEach(({ link }) => {
      fs.rmSync(path.resolve(__dirname, `../public${link}`), {
        recursive: true,
      });
    });

    await useDB(`DELETE FROM ${TB_NAME.DOWNLOAD} WHERE createAt `);
    logger.info('运行定时任务: 删除过期下载文件');
  } catch {
    logger.err('删除过期记录时发生错误');
  }
};

const cleanupVerificationCode = async () => {
  await useDB(
    `DELETE FROM ${TB_NAME.VEFIF_CODE} WHERE createdAt < NOW() - INTERVAL 1 DAY`
  );
  logger.info('运行定时任务: 删除过期短信验证码');
};

cron.schedule(MIDNIGHT, cleanupDownloadedFiles);
cron.schedule(MIDNIGHT, cleanupVerificationCode);
