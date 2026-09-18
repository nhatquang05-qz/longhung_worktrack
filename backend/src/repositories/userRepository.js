import { query } from '../config/db.js';

export const findByUsername = async (username) => {
  const sql = `
    SELECT id, full_name, username, password_hash, is_admin, must_change_password, is_active
    FROM users
    WHERE username = ?
    LIMIT 1
  `;
  const rows = await query(sql, [username]);
  return rows[0] || null;
};

export const findById = async (id) => {
  const sql = `
    SELECT id, full_name, username, is_admin, must_change_password, is_active, created_at
    FROM users
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
};

export const findAll = async () => {
  const sql = `
    SELECT id, full_name, username, is_admin, must_change_password, is_active, created_at, updated_at
    FROM users
    ORDER BY id ASC
  `;
  return await query(sql);
};

export const create = async ({ fullName, username, passwordHash }) => {
  const sql = `
    INSERT INTO users (full_name, username, password_hash, is_admin, must_change_password, is_active)
    VALUES (?, ?, ?, FALSE, TRUE, TRUE)
  `;
  const result = await query(sql, [fullName, username, passwordHash]);
  return result.insertId;
};

export const toggleStatus = async (id, isActive) => {
  const sql = `
    UPDATE users
    SET is_active = ?
    WHERE id = ?
  `;
  await query(sql, [isActive, id]);
};

export const resetPassword = async (id, passwordHash) => {
  const sql = `
    UPDATE users
    SET password_hash = ?, must_change_password = TRUE
    WHERE id = ?
  `;
  await query(sql, [passwordHash, id]);
};

export const updatePassword = async (id, passwordHash) => {
  const sql = `
    UPDATE users
    SET password_hash = ?, must_change_password = FALSE
    WHERE id = ?
  `;
  await query(sql, [passwordHash, id]);
};