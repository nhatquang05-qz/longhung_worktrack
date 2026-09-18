import mysql from 'mysql2/promise';
import { ENV } from './env.js';

export const pool = mysql.createPool({
  host: ENV.DB_HOST,
  port: Number(ENV.DB_PORT) || 4000,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false,
  },
});

export const query = async (sql, params = []) => {
  const [results] = await pool.execute(sql, params);
  return results;
};

// Bổ sung hàm kiểm tra kết nối để healthRoutes sử dụng
export const testDbConnection = async () => {
  const [result] = await pool.execute('SELECT 1 AS check_status');
  return result;
};