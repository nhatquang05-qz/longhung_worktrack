USE `task_management_db`;

-- Mật khẩu mặc định của admin là 'admin' được hash bằng bcrypt (10 rounds):
-- $2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1y0vK6Ua3mXv5qL7h9eF2wG1yR.Fqa
-- must_change_password = 0 (Admin mặc định không bị ép đổi mật khẩu ngay, hoặc có thể đổi tùy ý)

INSERT INTO `users` (`id`, `full_name`, `username`, `password_hash`, `is_admin`, `must_change_password`, `is_active`)
VALUES (
  1,
  'Quản Trị Viên',
  'admin',
  '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1y0vK6Ua3mXv5qL7h9eF2wG1yR.Fqa',
  1,
  0,
  1
)
ON DUPLICATE KEY UPDATE `username` = 'admin';