import { useDB } from 'database';
import { readFileSync } from 'fs';
import path from 'path';

export default function createTable() {
  const createUsersTableQuery = readFileSync(
    path.join(__dirname, './sql/create_user_table.sql'),
    'utf-8'
  );
  const createDownloadTableQuery = readFileSync(
    path.join(__dirname, './sql/create_download_table.sql'),
    'utf-8'
  );

  const promises = [
    useDB(createUsersTableQuery),
    useDB(createDownloadTableQuery),
  ];

  return new Promise((res, rej) => {
    const arr = Promise.race(promises);
    arr.then(res).catch(e => {
      return rej(e);
    });
  });
}
