import mysql from 'mysql2/promise';
import { ENV } from './env.js';

export const pool = mysql.createPool({
  host: ENV.DB_HOST,
  port: Number(ENV.DB_PORT) || 4000,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5, // Serverless nên để pool nhỏ (5-10) tránh tràn connection TiDB
  queueLimit: 0,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false, // Tránh lỗi thiếu CA root trên môi trường container Vercel
  },
});

export const query = async (sql, params = []) => {
  const [results] = await pool.execute(sql, params);
  return results;
};