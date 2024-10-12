import TB_NAME from 'constants/db_table_name';
import { useDB } from 'database';
import { readFileSync } from 'fs';
import path from 'path';

export default function createTable() {
  const readSqlFile = (file: string): string => {
    return readFileSync(
      path.join(__dirname, `./sql/create_${file}_table.sql`),
      'utf-8'
    );
  };

  const promises = [
    useDB(readSqlFile(TB_NAME.USER)),
    useDB(readSqlFile(TB_NAME.DOWNLOAD)),
    useDB(readSqlFile(TB_NAME.ACCOUNT)),
    useDB(readSqlFile(TB_NAME.WORK_DATA)),
    useDB(readSqlFile(TB_NAME.VEFIF_CODE)),
  ];

  return new Promise(async (res, rej) => {
    try {
      await Promise.all(promises);
      res(undefined);
    } catch (error) {
      return rej(error);
    }
  });
}
