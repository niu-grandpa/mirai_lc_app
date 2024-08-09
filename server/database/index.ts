import EnvVars from 'constants/env_vars';
import logger from 'jet-logger';
import mysql from 'mysql2';
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

export const queryDB = (query: string, params?: any) => {
  return new Promise((resolve, reject) => {
    pool.query(query, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

pool.getConnection((err, connection) => {
  if (err) {
    logger.err('数据库连接失败: ' + err.message);
  } else {
    logger.info('数据库连接成功');
    // 执行表创建
    createTable().then(() => {
      logger.info('所有的表均已创建!');
      connection.release(); // 释放连接
      pool.end(err => {
        if (err) {
          logger.err('关闭数据库连接池失败: ' + err.message);
        } else {
          logger.info('数据库连接池关闭');
        }
      });
    });
  }
});
