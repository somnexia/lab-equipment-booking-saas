-- Views — Lab Equipment Booking SaaS
-- MySQL / MariaDB 10.4+
-- Run: mysql -u root -p lab_equipment_booking < database/views.sql

USE `lab_equipment_booking`;

-- ---------------------------------------------------------------------------
-- v_equipment_catalog — catalog for dashboard and GET /api/equipment
-- JOIN: equipment + category + organization
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW `v_equipment_catalog` AS
SELECT
  e.`id` AS `equipment_id`,
  e.`organization_id`,
  o.`name` AS `organization_name`,
  e.`category_id`,
  c.`name` AS `category_name`,
  e.`name` AS `equipment_name`,
  e.`description`,
  e.`status`,
  e.`created_at`,
  CASE e.`status`
    WHEN 'available' THEN 'Available for booking'
    WHEN 'maintenance' THEN 'Maintenance'
    WHEN 'broken' THEN 'Broken'
  END AS `status_label`
FROM `equipment` e
INNER JOIN `organizations` o ON o.`id` = e.`organization_id`
LEFT JOIN `equipment_categories` c ON c.`id` = e.`category_id`;

-- ---------------------------------------------------------------------------
-- v_bookings_detail — booking list for GET /api/bookings
-- JOIN: bookings + user + equipment + organization
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW `v_bookings_detail` AS
SELECT
  b.`id` AS `booking_id`,
  b.`equipment_id`,
  e.`name` AS `equipment_name`,
  e.`status` AS `equipment_status`,
  b.`user_id`,
  u.`name` AS `user_name`,
  u.`email` AS `user_email`,
  u.`role` AS `user_role`,
  u.`organization_id`,
  o.`name` AS `organization_name`,
  b.`start_time`,
  b.`end_time`,
  b.`status` AS `booking_status`,
  b.`created_at`,
  CASE b.`status`
    WHEN 'active' THEN 'Active'
    WHEN 'completed' THEN 'Completed'
    WHEN 'cancelled' THEN 'Cancelled'
  END AS `booking_status_label`
FROM `bookings` b
INNER JOIN `users` u ON u.`id` = b.`user_id`
INNER JOIN `equipment` e ON e.`id` = b.`equipment_id`
INNER JOIN `organizations` o ON o.`id` = u.`organization_id`;

-- ---------------------------------------------------------------------------
-- v_active_bookings — active bookings only (calendar, availability checks)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW `v_active_bookings` AS
SELECT
  `booking_id`,
  `equipment_id`,
  `equipment_name`,
  `user_id`,
  `user_name`,
  `organization_id`,
  `organization_name`,
  `start_time`,
  `end_time`,
  `created_at`
FROM `v_bookings_detail`
WHERE `booking_status` = 'active';

-- ---------------------------------------------------------------------------
-- v_users_by_organization — user directory (lab admin UI)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW `v_users_by_organization` AS
SELECT
  u.`id` AS `user_id`,
  u.`organization_id`,
  o.`name` AS `organization_name`,
  u.`name` AS `user_name`,
  u.`email`,
  u.`role`,
  u.`created_at`
FROM `users` u
INNER JOIN `organizations` o ON o.`id` = u.`organization_id`;
