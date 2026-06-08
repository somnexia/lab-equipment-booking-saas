-- Права пользователей MySQL — Lab Equipment Booking SaaS
-- Соответствие ролям приложения: docs/04-crud-matrix.md
-- Запуск: mysql -u root -p < database/grants.sql
--
-- ВАЖНО: выполняйте от имени root (или пользователя с GRANT OPTION).
-- Пароли демо-ролей — смените перед продакшеном.

USE `lab_equipment_booking`;

-- ===========================================================================
-- 1. Служебный пользователь приложения (Node.js / .env DB_USER)
-- ===========================================================================
CREATE USER IF NOT EXISTS 'labuser'@'localhost' IDENTIFIED BY 'ChangeMe_LabUser';

-- Для разработки: полный доступ (упрощает работу API).
-- В отчёте: в продакшене можно ограничить до SELECT на VIEW + EXECUTE на процедуры.
GRANT ALL PRIVILEGES ON `lab_equipment_booking`.* TO 'labuser'@'localhost';

-- ===========================================================================
-- 2. system_admin — полный доступ к схеме
-- ===========================================================================
CREATE USER IF NOT EXISTS 'app_system_admin'@'localhost' IDENTIFIED BY 'ChangeMe_SysAdmin';

GRANT ALL PRIVILEGES ON `lab_equipment_booking`.* TO 'app_system_admin'@'localhost';

-- ===========================================================================
-- 3. lab_admin — администратор лаборатории
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
-- 4. equipment_manager — менеджер оборудования
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
-- 5. researcher — исследователь (бронирование)
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
-- 6. student — студент (минимальные права + бронирование через процедуры)
-- ===========================================================================
CREATE USER IF NOT EXISTS 'app_student'@'localhost' IDENTIFIED BY 'ChangeMe_Student';

-- Чтение только через представления (без прямого доступа к таблице users)
GRANT SELECT ON `lab_equipment_booking`.`v_equipment_catalog` TO 'app_student'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_bookings_detail` TO 'app_student'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_active_bookings` TO 'app_student'@'localhost';

-- Изменения броней — только через процедуры (проверки внутри sp_*)
GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_create_booking` TO 'app_student'@'localhost';
GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_update_booking` TO 'app_student'@'localhost';
GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_cancel_booking` TO 'app_student'@'localhost';
GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_complete_booking` TO 'app_student'@'localhost';

-- ===========================================================================
-- 7. technician — техник (статус оборудования + просмотр)
-- ===========================================================================
CREATE USER IF NOT EXISTS 'app_technician'@'localhost' IDENTIFIED BY 'ChangeMe_Technician';

GRANT SELECT ON `lab_equipment_booking`.`equipment` TO 'app_technician'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`bookings` TO 'app_technician'@'localhost';

GRANT SELECT ON `lab_equipment_booking`.`v_equipment_catalog` TO 'app_technician'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_bookings_detail` TO 'app_technician'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_active_bookings` TO 'app_technician'@'localhost';

GRANT EXECUTE ON PROCEDURE `lab_equipment_booking`.`sp_update_equipment_status` TO 'app_technician'@'localhost';

-- ===========================================================================
-- 8. readonly — только отчёты (витрина данных)
-- ===========================================================================
CREATE USER IF NOT EXISTS 'app_readonly'@'localhost' IDENTIFIED BY 'ChangeMe_ReadOnly';

GRANT SELECT ON `lab_equipment_booking`.`v_equipment_catalog` TO 'app_readonly'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_bookings_detail` TO 'app_readonly'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_active_bookings` TO 'app_readonly'@'localhost';
GRANT SELECT ON `lab_equipment_booking`.`v_users_by_organization` TO 'app_readonly'@'localhost';

-- ===========================================================================
FLUSH PRIVILEGES;
