import { query } from '../config/db.js';

export const findByUsername = async (username) => {
  const sql = `
    SELECT id, full_name, username, password_hash, is_admin, must_change_password, is_active
    FROM users
    WHERE username = ?
    LIMIT 1
  `;
  const rows = await query(sql, [username]);
  if (!rows || rows.length === 0) return null;
  const user = rows[0];

  return {
    ...user,
    fullName: user.full_name,
    isAdmin: Boolean(user.is_admin),
    mustChangePassword: Boolean(user.must_change_password),
    isActive: Boolean(user.is_active),
  };
};

export const findById = async (id) => {
  const sql = `
    SELECT id, full_name, username, is_admin, must_change_password, is_active, created_at
    FROM users
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await query(sql, [id]);
  if (!rows || rows.length === 0) return null;
  const user = rows[0];

  return {
    ...user,
    fullName: user.full_name,
    isAdmin: Boolean(user.is_admin),
    mustChangePassword: Boolean(user.must_change_password),
    isActive: Boolean(user.is_active),
  };
};

export const findAll = async () => {
  const sql = `
    SELECT 
      id, 
      full_name, 
      full_name AS fullName,
      username, 
      is_admin, 
      is_admin AS isAdmin,
      must_change_password, 
      must_change_password AS mustChangePassword,
      is_active, 
      is_active AS isActive,
      created_at, 
      created_at AS createdAt,
      updated_at,
      updated_at AS updatedAt
    FROM users
    ORDER BY id ASC
  `;
  const rows = await query(sql);
  
  return (rows || []).map((u) => ({
    ...u,
    fullName: u.full_name,
    isAdmin: Boolean(u.is_admin),
    mustChangePassword: Boolean(u.must_change_password),
    isActive: Boolean(u.is_active),
  }));
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