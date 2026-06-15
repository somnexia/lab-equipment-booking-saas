-- Migration from legacy roles (admin, manager, user) to the new model.
-- Run on an existing DB if you are not recreating it via schema.sql + seed.sql.

USE `lab_equipment_booking`;

ALTER TABLE `organizations`
  MODIFY `description` TEXT DEFAULT NULL;

-- Step 1: extend ENUM while keeping old values
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

-- Step 2: new values only (no guest)
ALTER TABLE `users`
  MODIFY `role` ENUM(
    'system_admin',
    'lab_admin',
    'equipment_manager',
    'researcher',
    'student',
    'technician'
  ) NOT NULL DEFAULT 'student';
