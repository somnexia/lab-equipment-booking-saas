-- MySQL user privileges — Lab Equipment Booking SaaS
-- Maps to application roles: docs/04-crud-matrix.md
-- Run: mysql -u root -p < database/grants.sql
--
-- IMPORTANT: run as root (or a user with GRANT OPTION).
-- Change demo role passwords before production.

USE `lab_equipment_booking`;

-- ===========================================================================
-- 1. Application service user (Node.js / .env DB_USER)
-- ===========================================================================
CREATE USER IF NOT EXISTS 'labuser'@'localhost' IDENTIFIED BY 'ChangeMe_LabUser';

-- Development: full access (simplifies API work).
-- In production you can restrict to SELECT on VIEWs + EXECUTE on procedures.
GRANT ALL PRIVILEGES ON `lab_equipment_booking`.* TO 'labuser'@'localhost';

-- ===========================================================================
-- 2. system_admin — full schema access
-- ===========================================================================
CREATE USER IF NOT EXISTS 'app_system_admin'@'localhost' IDENTIFIED BY 'ChangeMe_SysAdmin';

GRANT ALL PRIVILEGES ON `lab_equipment_booking`.* TO 'app_system_admin'@'localhost';

-- ===========================================================================
-- 3. lab_admin — laboratory administrator
-- ===========================================================================
CREATE USER IF NOT EXISTS 'app_lab_admin'@'localhost' IDENTIFIED BY 'ChangeMe_LabAdmin';

GRANT SELECT, INSERT, UPDATE, DELETE ON `lab_equipment_booking`.`organizations` TO 'app_lab_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON `lab_equipment_booking`.`users` TO 'app_lab_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON `lab_equipment_booking`.`equipment_categories` TO 'app_lab_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON `lab_equipment_booking`.`equipment` TO 'app_lab_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON `lab_equipment_booking`.`bookings` TO 'app_lab_admin'@'localhost';

GRANT SELECT ON `lab_equipment_booking`.`v_equipment_catalog` TO 'app_lab_admin'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_bookings_detail` TO 'app_lab_admin'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_active_bookings` TO 'app_lab_admin'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_users_by_organization` TO 'app_lab_admin'@'localhost';

GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_create_booking` TO 'app_lab_admin'@'localhost';
GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_update_booking` TO 'app_lab_admin'@'localhost';
GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_cancel_booking` TO 'app_lab_admin'@'localhost';
GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_complete_booking` TO 'app_lab_admin'@'localhost';
GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_update_equipment_status` TO 'app_lab_admin'@'localhost';

-- ===========================================================================
-- 4. equipment_manager — equipment manager
-- ===========================================================================
CREATE USER IF NOT EXISTS 'app_equipment_mgr'@'localhost' IDENTIFIED BY 'ChangeMe_EqMgr';

GRANT SELECT ON `lab_equipment_booking`.`organizations` TO 'app_equipment_mgr'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`users` TO 'app_equipment_mgr'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON `lab_equipment_booking`.`equipment_categories` TO 'app_equipment_mgr'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON `lab_equipment_booking`.`equipment` TO 'app_equipment_mgr'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`bookings` TO 'app_equipment_mgr'@'localhost';

GRANT SELECT ON `lab_equipment_booking`.`v_equipment_catalog` TO 'app_equipment_mgr'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_bookings_detail` TO 'app_equipment_mgr'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_active_bookings` TO 'app_equipment_mgr'@'localhost';

GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_update_equipment_status` TO 'app_equipment_mgr'@'localhost';

-- ===========================================================================
-- 5. researcher — booking workflows
-- ===========================================================================
CREATE USER IF NOT EXISTS 'app_researcher'@'localhost' IDENTIFIED BY 'ChangeMe_Researcher';

GRANT SELECT ON `lab_equipment_booking`.`users` TO 'app_researcher'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`equipment` TO 'app_researcher'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`bookings` TO 'app_researcher'@'localhost';

GRANT SELECT ON `lab_equipment_booking`.`v_equipment_catalog` TO 'app_researcher'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_bookings_detail` TO 'app_researcher'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_active_bookings` TO 'app_researcher'@'localhost';

GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_create_booking` TO 'app_researcher'@'localhost';
GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_update_booking` TO 'app_researcher'@'localhost';
GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_cancel_booking` TO 'app_researcher'@'localhost';
GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_complete_booking` TO 'app_researcher'@'localhost';

-- ===========================================================================
-- 6. student — minimal rights + booking via procedures
-- ===========================================================================
CREATE USER IF NOT EXISTS 'app_student'@'localhost' IDENTIFIED BY 'ChangeMe_Student';

-- Read only via views (no direct access to users table)
GRANT SELECT ON `lab_equipment_booking`.`v_equipment_catalog` TO 'app_student'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_bookings_detail` TO 'app_student'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_active_bookings` TO 'app_student'@'localhost';

-- Booking changes — procedures only (checks inside sp_*)
GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_create_booking` TO 'app_student'@'localhost';
GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_update_booking` TO 'app_student'@'localhost';
GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_cancel_booking` TO 'app_student'@'localhost';
GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_complete_booking` TO 'app_student'@'localhost';

-- ===========================================================================
-- 7. technician — equipment status + read access
-- ===========================================================================
CREATE USER IF NOT EXISTS 'app_technician'@'localhost' IDENTIFIED BY 'ChangeMe_Technician';

GRANT SELECT ON `lab_equipment_booking`.`equipment` TO 'app_technician'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`bookings` TO 'app_technician'@'localhost';

GRANT SELECT ON `lab_equipment_booking`.`v_equipment_catalog` TO 'app_technician'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_bookings_detail` TO 'app_technician'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_active_bookings` TO 'app_technician'@'localhost';

GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_update_equipment_status` TO 'app_technician'@'localhost';

-- ===========================================================================
-- 8. readonly — reports only (data mart)
-- ===========================================================================
CREATE USER IF NOT EXISTS 'app_readonly'@'localhost' IDENTIFIED BY 'ChangeMe_ReadOnly';

GRANT SELECT ON `lab_equipment_booking`.`v_equipment_catalog` TO 'app_readonly'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_bookings_detail` TO 'app_readonly'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_active_bookings` TO 'app_readonly'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_users_by_organization` TO 'app_readonly'@'localhost';

-- ===========================================================================
FLUSH PRIVILEGES;
