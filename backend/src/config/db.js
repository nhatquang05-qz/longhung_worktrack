import mysql from 'mysql2/promise';
import { ENV } from './env.js';

export const pool = mysql.createPool({
  host: ENV.DB.HOST,
  port: ENV.DB.PORT,
  user: ENV.DB.USER,
  password: ENV.DB.PASSWORD,
  database: ENV.DB.NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00',
  dateStrings: true,
});

export const query = async (sql, params) => {
  const [results] = await pool.execute(sql, params);
  return results;
};

export const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { ok: true, message: 'MySQL connected successfully' };
  } catch (error) {
    return { ok: false, message: error.message };
  }
};