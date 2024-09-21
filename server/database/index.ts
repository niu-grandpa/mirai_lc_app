import EnvVars from 'constants/env_vars';
import logger from 'jet-logger';
import mysql, { OkPacket } from 'mysql2';
import createTable from './create_table';

const { DataBase } = EnvVars;

const pool = mysql.createPool({
  connectionLimit: 10,
  host: DataBase.host,
  port: DataBase.port,
  user: DataBase.user,
  password: DataBase.pwd,
  database: DataBase.name,
});

export const useDB = <T = OkPacket>(sql: string, params?: any[]) => {
  return new Promise<T[]>((resolve, reject) => {
    pool.execute(sql, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results as T[]);
    });
  });
};

const getConnection = (err: any) => {
  if (err) {
    logger.err('数据库连接失败: ' + err.message);
  } else {
    logger.info('数据库连接成功');
    // 执行表创建
    createTable().then(() => {
      logger.info('表创建成功!');
    });
  }
};

pool.getConnection(getConnection);
