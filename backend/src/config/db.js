import mysql from 'mysql2/promise';
import { ENV } from './env.js';

export const pool = mysql.createPool({
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
});

export const query = async (sql, params = []) => {
  const [results] = await pool.execute(sql, params);
  return results;
};