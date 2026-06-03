-- Миграция со старых ролей (admin, manager, user) на новую модель.
-- Выполните на существующей БД, если не пересоздаёте её через schema.sql + seed.sql.

USE `lab_equipment_booking`;

ALTER TABLE `organizations`
  MODIFY `description` TEXT DEFAULT NULL;

-- Шаг 1: расширяем ENUM, сохраняя старые значения
ALTER TABLE `users`
  MODIFY `role` ENUM(
    'admin',
    'manager',
    'user',
    'system_admin',
    'lab_admin',
    'equipment_manager',
    'researcher',
    'student',
    'technician',
    'guest'
  ) NOT NULL DEFAULT 'student';

UPDATE `users` SET `role` = 'system_admin' WHERE `role` = 'admin';
UPDATE `users` SET `role` = 'student' WHERE `role` = 'guest';
UPDATE `users` SET `role` = 'equipment_manager' WHERE `role` = 'manager';
UPDATE `users` SET `role` = 'student' WHERE `role` = 'user';

-- Шаг 2: только новые значения (без guest)
ALTER TABLE `users`
  MODIFY `role` ENUM(
    'system_admin',
    'lab_admin',
    'equipment_manager',
    'researcher',
    'student',
    'technician'
  ) NOT NULL DEFAULT 'student';
