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
    useDB(readSqlFile('user')),
    useDB(readSqlFile('download')),
    useDB(readSqlFile('work_data')),
  ];

  return new Promise(async (res, rej) => {
    try {
      const values = await Promise.race(promises);
      res(values);
    } catch (error) {
      return rej(error);
    }
  });
}
