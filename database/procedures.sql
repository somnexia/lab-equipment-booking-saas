-- Хранимые функции и процедуры Lab Equipment Booking SaaS
-- MySQL / MariaDB 10.4+
-- Запуск: mysql -u root -p lab_equipment_booking < database/procedures.sql

USE `lab_equipment_booking`;

-- ---------------------------------------------------------------------------
-- Функция: пересечение с активными бронями (1 = конфликт)
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS `fn_booking_has_conflict`;

DELIMITER $$

CREATE FUNCTION `fn_booking_has_conflict`(
  p_equipment_id INT,
  p_start_time DATETIME,
  p_end_time DATETIME,
  p_exclude_booking_id INT
) RETURNS TINYINT(1)
READS SQL DATA
NOT DETERMINISTIC
BEGIN
  DECLARE v_cnt INT DEFAULT 0;

  SELECT COUNT(*) INTO v_cnt
  FROM `bookings`
  WHERE `equipment_id` = p_equipment_id
    AND `status` = 'active'
    AND (p_exclude_booking_id IS NULL OR `id` <> p_exclude_booking_id)
    AND `start_time` < p_end_time
    AND `end_time` > p_start_time;

  RETURN IF(v_cnt > 0, 1, 0);
END$$

-- ---------------------------------------------------------------------------
-- sp_create_booking — создание брони (UC-30)
-- Акторы: system_admin, lab_admin, researcher, student
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_create_booking`$$

CREATE PROCEDURE `sp_create_booking`(
  IN p_equipment_id INT,
  IN p_user_id INT,
  IN p_start_time DATETIME,
  IN p_end_time DATETIME,
  IN p_actor_id INT,
  IN p_actor_role VARCHAR(32)
)
BEGIN
  DECLARE v_equip_org INT;
  DECLARE v_user_org INT;
  DECLARE v_actor_org INT;
  DECLARE v_equip_status VARCHAR(20);
  DECLARE v_new_id INT;

  IF p_end_time <= p_start_time THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'end_time must be after start_time';
  END IF;

  IF p_actor_role NOT IN ('system_admin', 'lab_admin', 'researcher', 'student') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Role cannot create bookings';
  END IF;

  IF p_actor_role = 'student' AND p_actor_id <> p_user_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student can only book for self';
  END IF;

  SELECT `organization_id`, `status` INTO v_equip_org, v_equip_status
  FROM `equipment` WHERE `id` = p_equipment_id;

  IF v_equip_org IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Equipment not found';
  END IF;

  IF v_equip_status <> 'available' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Equipment is not available for booking';
  END IF;

  SELECT `organization_id` INTO v_user_org FROM `users` WHERE `id` = p_user_id;
  IF v_user_org IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
  END IF;

  IF v_equip_org <> v_user_org THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User and equipment belong to different organizations';
  END IF;

  IF p_actor_role <> 'system_admin' THEN
    SELECT `organization_id` INTO v_actor_org FROM `users` WHERE `id` = p_actor_id;
    IF v_actor_org IS NULL OR v_actor_org <> v_user_org THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Actor cannot book for this organization';
    END IF;
  END IF;

  IF fn_booking_has_conflict(p_equipment_id, p_start_time, p_end_time, NULL) = 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Time slot conflicts with an active booking';
  END IF;

  INSERT INTO `bookings` (`equipment_id`, `user_id`, `start_time`, `end_time`, `status`)
  VALUES (p_equipment_id, p_user_id, p_start_time, p_end_time, 'active');

  SET v_new_id = LAST_INSERT_ID();

  SELECT v_new_id AS `booking_id`, 'active' AS `status`, 'OK' AS `result`;
END$$

-- ---------------------------------------------------------------------------
-- sp_update_booking — изменение слота (только active)
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_update_booking`$$

CREATE PROCEDURE `sp_update_booking`(
  IN p_booking_id INT,
  IN p_start_time DATETIME,
  IN p_end_time DATETIME,
  IN p_actor_id INT,
  IN p_actor_role VARCHAR(32)
)
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_equipment_id INT;
  DECLARE v_user_id INT;
  DECLARE v_user_org INT;
  DECLARE v_actor_org INT;

  SELECT `status`, `equipment_id`, `user_id`
  INTO v_status, v_equipment_id, v_user_id
  FROM `bookings` WHERE `id` = p_booking_id;

  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Booking not found';
  END IF;

  IF v_status <> 'active' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only active bookings can be updated';
  END IF;

  IF p_actor_role NOT IN ('system_admin', 'lab_admin', 'researcher', 'student') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Role cannot update bookings';
  END IF;

  IF p_actor_role = 'student' AND p_actor_id <> v_user_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student can only update own bookings';
  END IF;

  IF p_end_time <= p_start_time THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'end_time must be after start_time';
  END IF;

  IF p_actor_role <> 'system_admin' THEN
    SELECT `organization_id` INTO v_user_org FROM `users` WHERE `id` = v_user_id;
    SELECT `organization_id` INTO v_actor_org FROM `users` WHERE `id` = p_actor_id;
    IF v_actor_org IS NULL OR v_actor_org <> v_user_org THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Actor cannot update this booking';
    END IF;
  END IF;

  IF fn_booking_has_conflict(v_equipment_id, p_start_time, p_end_time, p_booking_id) = 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Time slot conflicts with an active booking';
  END IF;

  UPDATE `bookings`
  SET `start_time` = p_start_time, `end_time` = p_end_time
  WHERE `id` = p_booking_id;

  SELECT p_booking_id AS `booking_id`, 'active' AS `status`, 'OK' AS `result`;
END$$

-- ---------------------------------------------------------------------------
-- sp_cancel_booking — отмена (cancelled), вместо DELETE в API
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_cancel_booking`$$

CREATE PROCEDURE `sp_cancel_booking`(
  IN p_booking_id INT,
  IN p_actor_id INT,
  IN p_actor_role VARCHAR(32)
)
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_user_id INT;
  DECLARE v_user_org INT;
  DECLARE v_actor_org INT;

  SELECT `status`, `user_id` INTO v_status, v_user_id
  FROM `bookings` WHERE `id` = p_booking_id;

  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Booking not found';
  END IF;

  IF v_status <> 'active' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only active bookings can be cancelled';
  END IF;

  IF p_actor_role IN ('system_admin', 'lab_admin') THEN
    SET @allow = 1;
  ELSEIF p_actor_role = 'researcher' THEN
    SELECT `organization_id` INTO v_user_org FROM `users` WHERE `id` = v_user_id;
    SELECT `organization_id` INTO v_actor_org FROM `users` WHERE `id` = p_actor_id;
    IF v_actor_org = v_user_org THEN
      SET @allow = 1;
    ELSE
      SET @allow = 0;
    END IF;
  ELSEIF p_actor_role = 'student' AND p_actor_id = v_user_id THEN
    SET @allow = 1;
  ELSE
    SET @allow = 0;
  END IF;

  IF @allow <> 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Role cannot cancel this booking';
  END IF;

  UPDATE `bookings` SET `status` = 'cancelled' WHERE `id` = p_booking_id;

  SELECT p_booking_id AS `booking_id`, 'cancelled' AS `status`, 'OK' AS `result`;
END$$

-- ---------------------------------------------------------------------------
-- sp_complete_booking — завершение (completed)
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_complete_booking`$$

CREATE PROCEDURE `sp_complete_booking`(
  IN p_booking_id INT,
  IN p_actor_id INT,
  IN p_actor_role VARCHAR(32)
)
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_user_id INT;
  DECLARE v_user_org INT;
  DECLARE v_actor_org INT;

  SELECT `status`, `user_id` INTO v_status, v_user_id
  FROM `bookings` WHERE `id` = p_booking_id;

  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Booking not found';
  END IF;

  IF v_status <> 'active' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only active bookings can be completed';
  END IF;

  IF p_actor_role NOT IN ('system_admin', 'lab_admin', 'researcher', 'student') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Role cannot complete bookings';
  END IF;

  IF p_actor_role = 'student' AND p_actor_id <> v_user_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student can only complete own bookings';
  END IF;

  IF p_actor_role NOT IN ('system_admin', 'lab_admin') THEN
    SELECT `organization_id` INTO v_user_org FROM `users` WHERE `id` = v_user_id;
    SELECT `organization_id` INTO v_actor_org FROM `users` WHERE `id` = p_actor_id;
    IF v_actor_org IS NULL OR v_actor_org <> v_user_org THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Actor cannot complete this booking';
    END IF;
  END IF;

  UPDATE `bookings` SET `status` = 'completed' WHERE `id` = p_booking_id;

  SELECT p_booking_id AS `booking_id`, 'completed' AS `status`, 'OK' AS `result`;
END$$

-- ---------------------------------------------------------------------------
-- sp_update_equipment_status — статус оборудования (техник, менеджер, админы)
-- ---------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `sp_update_equipment_status`$$

CREATE PROCEDURE `sp_update_equipment_status`(
  IN p_equipment_id INT,
  IN p_new_status ENUM('available', 'maintenance', 'broken'),
  IN p_actor_id INT,
  IN p_actor_role VARCHAR(32)
)
BEGIN
  DECLARE v_exists INT DEFAULT 0;

  IF p_actor_role NOT IN ('system_admin', 'lab_admin', 'equipment_manager', 'technician') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Role cannot change equipment status';
  END IF;

  SELECT COUNT(*) INTO v_exists FROM `equipment` WHERE `id` = p_equipment_id;
  IF v_exists = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Equipment not found';
  END IF;

  IF p_actor_role NOT IN ('system_admin', 'lab_admin') THEN
    IF NOT EXISTS (
      SELECT 1 FROM `equipment` e
      INNER JOIN `users` u ON u.`organization_id` = e.`organization_id`
      WHERE e.`id` = p_equipment_id AND u.`id` = p_actor_id
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Actor cannot update equipment in another organization';
    END IF;
  END IF;

  UPDATE `equipment` SET `status` = p_new_status WHERE `id` = p_equipment_id;

  SELECT p_equipment_id AS `equipment_id`, p_new_status AS `status`, 'OK' AS `result`;
END$$

DELIMITER ;
