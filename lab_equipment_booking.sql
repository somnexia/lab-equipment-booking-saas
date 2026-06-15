-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Июн 15 2026 г., 14:18
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `lab_equipment_booking`
--

DELIMITER $$
--
-- Процедуры
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_cancel_booking` (IN `p_booking_id` INT, IN `p_actor_id` INT, IN `p_actor_role` VARCHAR(32))   BEGIN
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_complete_booking` (IN `p_booking_id` INT, IN `p_actor_id` INT, IN `p_actor_role` VARCHAR(32))   BEGIN
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_create_booking` (IN `p_equipment_id` INT, IN `p_user_id` INT, IN `p_start_time` DATETIME, IN `p_end_time` DATETIME, IN `p_actor_id` INT, IN `p_actor_role` VARCHAR(32))   BEGIN
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_booking` (IN `p_booking_id` INT, IN `p_start_time` DATETIME, IN `p_end_time` DATETIME, IN `p_actor_id` INT, IN `p_actor_role` VARCHAR(32))   BEGIN
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_equipment_status` (IN `p_equipment_id` INT, IN `p_new_status` ENUM('available','maintenance','broken'), IN `p_actor_id` INT, IN `p_actor_role` VARCHAR(32))   BEGIN
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

--
-- Функции
--
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_booking_has_conflict` (`p_equipment_id` INT, `p_start_time` DATETIME, `p_end_time` DATETIME, `p_exclude_booking_id` INT) RETURNS TINYINT(1) READS SQL DATA BEGIN
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

DELIMITER ;

-- --------------------------------------------------------

--
-- Структура таблицы `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `equipment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `bookings`
--

INSERT INTO `bookings` (`id`, `equipment_id`, `user_id`, `start_time`, `end_time`, `status`, `created_at`) VALUES
(1, 1, 4, '2026-06-10 09:00:00', '2026-06-10 11:00:00', 'completed', '2026-06-03 10:51:28'),
(2, 2, 5, '2026-06-11 14:00:00', '2026-06-11 16:00:00', 'completed', '2026-06-03 10:51:28'),
(3, 4, 4, '2026-06-12 10:00:00', '2026-06-12 12:00:00', 'completed', '2026-06-03 10:51:28'),
(4, 1, 1, '2026-06-14 23:00:00', '2026-06-15 01:00:00', 'completed', '2026-06-14 19:45:22'),
(5, 1, 1, '2026-06-16 00:00:00', '2026-06-30 02:00:00', 'cancelled', '2026-06-14 20:22:52'),
(6, 2, 5, '2026-06-15 00:00:00', '2026-06-15 02:00:00', 'completed', '2026-06-14 20:51:29'),
(7, 2, 5, '2026-06-18 00:00:00', '2026-06-24 02:00:00', 'completed', '2026-06-14 20:51:55'),
(8, 1, 1, '2026-06-15 00:00:00', '2026-06-26 02:00:00', 'completed', '2026-06-14 20:55:08'),
(9, 6, 4, '2026-06-17 00:00:00', '2026-06-23 02:00:00', 'completed', '2026-06-14 20:58:38'),
(10, 3, 1, '2026-06-15 01:00:00', '2026-06-17 03:00:00', 'active', '2026-06-14 21:04:21'),
(11, 7, 1, '2026-06-15 01:00:00', '2026-06-19 03:00:00', 'active', '2026-06-14 21:33:27'),
(12, 4, 7, '2026-06-16 13:00:00', '2026-06-19 15:00:00', 'active', '2026-06-15 09:49:24');

-- --------------------------------------------------------

--
-- Структура таблицы `equipment`
--

CREATE TABLE `equipment` (
  `id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('available','maintenance','broken') NOT NULL DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `equipment`
--

INSERT INTO `equipment` (`id`, `organization_id`, `category_id`, `name`, `description`, `status`, `created_at`) VALUES
(1, 1, 1, 'Колба Эрленмейера 250 мл', 'Стеклянная колба для химических опытов', 'available', '2026-06-03 10:51:28'),
(2, 1, 1, 'Пробирка стеклянная 10 мл', 'Стандартная лабораторная пробирка', 'available', '2026-06-03 10:51:28'),
(3, 1, 2, 'Аналитические весы', 'Высокоточные лабораторные весы', 'available', '2026-06-03 10:51:28'),
(4, 2, 3, 'Осциллограф', 'Измерение электрических сигналов', 'available', '2026-06-03 10:51:28'),
(5, 2, 3, 'Мультиметр', 'Измерение напряжения и тока', 'available', '2026-06-03 10:51:28'),
(6, 1, 1, 'Прибор от manager', 'org 1', 'available', '2026-06-08 19:31:56'),
(7, 1, 1, 'Пробирка стеклянная 20 мл', 'Пробирка стеклянная 10 мл', 'available', '2026-06-14 21:33:16');

-- --------------------------------------------------------

--
-- Структура таблицы `equipment_categories`
--

CREATE TABLE `equipment_categories` (
  `id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `equipment_categories`
--

INSERT INTO `equipment_categories` (`id`, `organization_id`, `name`, `description`, `created_at`) VALUES
(1, 1, 'Лабораторная посуда', 'Колбы, пробирки, стаканы', '2026-06-03 10:51:28'),
(2, 1, 'Измерительные приборы', 'Весы, pH-метры', '2026-06-03 10:51:28'),
(3, 2, 'Электроника', 'Осциллографы, мультиметры', '2026-06-03 10:51:28');

-- --------------------------------------------------------

--
-- Структура таблицы `organizations`
--

CREATE TABLE `organizations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `organizations`
--

INSERT INTO `organizations` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Лаборатория химии', 'Обновлено system_admin', '2026-06-03 10:51:28'),
(2, 'Лаборатория физики', 'Лаборатория электроники и измерительных приборов', '2026-06-03 10:51:28');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` text NOT NULL,
  `role` enum('system_admin','lab_admin','equipment_manager','researcher','student','technician') NOT NULL DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `organization_id`, `name`, `email`, `password_hash`, `role`, `created_at`) VALUES
(1, 1, 'Сергей Системов', 'admin@lab.local', '$2b$10$m/FWZv0eTvUl.2FfUf5HL.zbPBL3mjB4CDmmjBT/RYluQTWIJ1jIi', 'system_admin', '2026-06-03 10:51:28'),
(2, 1, 'Мария Лаборантова', 'lab.admin@chem.lab.local', '$2b$10$m/FWZv0eTvUl.2FfUf5HL.zbPBL3mjB4CDmmjBT/RYluQTWIJ1jIi', 'lab_admin', '2026-06-03 10:51:28'),
(3, 1, 'Иван Менеджеров', 'manager@chem.lab.local', '$2b$10$m/FWZv0eTvUl.2FfUf5HL.zbPBL3mjB4CDmmjBT/RYluQTWIJ1jIi', 'equipment_manager', '2026-06-03 10:51:28'),
(4, 1, 'Алексей Исследов', 'researcher@chem.lab.local', '$2b$10$m/FWZv0eTvUl.2FfUf5HL.zbPBL3mjB4CDmmjBT/RYluQTWIJ1jIi', 'researcher', '2026-06-03 10:51:28'),
(5, 1, 'Пётр Студентов', 'student@chem.lab.local', '$2b$10$m/FWZv0eTvUl.2FfUf5HL.zbPBL3mjB4CDmmjBT/RYluQTWIJ1jIi', 'student', '2026-06-03 10:51:28'),
(6, 1, 'Тестовый Техник', 'tech.test@chem.lab.local', '$2b$10$rUiFgoUon2Y.PO33SOLVu.4f9siHmrh7IerqdZuNGVcpk0kKP1pmu', 'technician', '2026-06-14 21:00:47'),
(7, 2, 'testuser', 'testuser@mail.com', '$2b$10$46t8SDTmLXmi/.DQ7OeN0emsdIC4nrLJlNPNcufRgo8XAdzYsJJSe', 'student', '2026-06-15 09:47:55');

-- --------------------------------------------------------

--
-- Дублирующая структура для представления `v_active_bookings`
-- (См. Ниже фактическое представление)
--
CREATE TABLE `v_active_bookings` (
`booking_id` int(11)
,`equipment_id` int(11)
,`equipment_name` varchar(255)
,`user_id` int(11)
,`user_name` varchar(255)
,`organization_id` int(11)
,`organization_name` varchar(255)
,`start_time` datetime
,`end_time` datetime
,`created_at` timestamp
);

-- --------------------------------------------------------

--
-- Дублирующая структура для представления `v_bookings_detail`
-- (См. Ниже фактическое представление)
--
CREATE TABLE `v_bookings_detail` (
`booking_id` int(11)
,`equipment_id` int(11)
,`equipment_name` varchar(255)
,`equipment_status` enum('available','maintenance','broken')
,`user_id` int(11)
,`user_name` varchar(255)
,`user_email` varchar(255)
,`user_role` enum('system_admin','lab_admin','equipment_manager','researcher','student','technician')
,`organization_id` int(11)
,`organization_name` varchar(255)
,`start_time` datetime
,`end_time` datetime
,`booking_status` enum('active','completed','cancelled')
,`created_at` timestamp
,`booking_status_label` varchar(18)
);

-- --------------------------------------------------------

--
-- Дублирующая структура для представления `v_equipment_catalog`
-- (См. Ниже фактическое представление)
--
CREATE TABLE `v_equipment_catalog` (
`equipment_id` int(11)
,`organization_id` int(11)
,`organization_name` varchar(255)
,`category_id` int(11)
,`category_name` varchar(255)
,`equipment_name` varchar(255)
,`description` text
,`status` enum('available','maintenance','broken')
,`created_at` timestamp
,`status_label` varchar(48)
);

-- --------------------------------------------------------

--
-- Дублирующая структура для представления `v_users_by_organization`
-- (См. Ниже фактическое представление)
--
CREATE TABLE `v_users_by_organization` (
`user_id` int(11)
,`organization_id` int(11)
,`organization_name` varchar(255)
,`user_name` varchar(255)
,`email` varchar(255)
,`role` enum('system_admin','lab_admin','equipment_manager','researcher','student','technician')
,`created_at` timestamp
);

-- --------------------------------------------------------

--
-- Структура для представления `v_active_bookings`
--
DROP TABLE IF EXISTS `v_active_bookings`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_active_bookings`  AS SELECT `v_bookings_detail`.`booking_id` AS `booking_id`, `v_bookings_detail`.`equipment_id` AS `equipment_id`, `v_bookings_detail`.`equipment_name` AS `equipment_name`, `v_bookings_detail`.`user_id` AS `user_id`, `v_bookings_detail`.`user_name` AS `user_name`, `v_bookings_detail`.`organization_id` AS `organization_id`, `v_bookings_detail`.`organization_name` AS `organization_name`, `v_bookings_detail`.`start_time` AS `start_time`, `v_bookings_detail`.`end_time` AS `end_time`, `v_bookings_detail`.`created_at` AS `created_at` FROM `v_bookings_detail` WHERE `v_bookings_detail`.`booking_status` = 'active' ;

-- --------------------------------------------------------

--
-- Структура для представления `v_bookings_detail`
--
DROP TABLE IF EXISTS `v_bookings_detail`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_bookings_detail`  AS SELECT `b`.`id` AS `booking_id`, `b`.`equipment_id` AS `equipment_id`, `e`.`name` AS `equipment_name`, `e`.`status` AS `equipment_status`, `b`.`user_id` AS `user_id`, `u`.`name` AS `user_name`, `u`.`email` AS `user_email`, `u`.`role` AS `user_role`, `u`.`organization_id` AS `organization_id`, `o`.`name` AS `organization_name`, `b`.`start_time` AS `start_time`, `b`.`end_time` AS `end_time`, `b`.`status` AS `booking_status`, `b`.`created_at` AS `created_at`, CASE `b`.`status` WHEN 'active' THEN '╨Р╨║╤В╨╕╨▓╨╜╨░╤П' WHEN 'completed' THEN '╨Ч╨░╨▓╨╡╤А╤И╨╡╨╜╨░' WHEN 'cancelled' THEN '╨Ю╤В╨╝╨╡╨╜╨╡╨╜╨░' END AS `booking_status_label` FROM (((`bookings` `b` join `users` `u` on(`u`.`id` = `b`.`user_id`)) join `equipment` `e` on(`e`.`id` = `b`.`equipment_id`)) join `organizations` `o` on(`o`.`id` = `u`.`organization_id`)) ;

-- --------------------------------------------------------

--
-- Структура для представления `v_equipment_catalog`
--
DROP TABLE IF EXISTS `v_equipment_catalog`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_equipment_catalog`  AS SELECT `e`.`id` AS `equipment_id`, `e`.`organization_id` AS `organization_id`, `o`.`name` AS `organization_name`, `e`.`category_id` AS `category_id`, `c`.`name` AS `category_name`, `e`.`name` AS `equipment_name`, `e`.`description` AS `description`, `e`.`status` AS `status`, `e`.`created_at` AS `created_at`, CASE `e`.`status` WHEN 'available' THEN '╨Ф╨╛╤Б╤В╤Г╨┐╨╜╨╛ ╨┤╨╗╤П ╨▒╤А╨╛╨╜╨╕╤А╨╛╨▓╨░╨╜╨╕╤П' WHEN 'maintenance' THEN '╨в╨╡╤Е╨╛╨▒╤Б╨╗╤Г╨╢╨╕╨▓╨░╨╜╨╕╨╡' WHEN 'broken' THEN '╨Э╨╡╨╕╤Б╨┐╤А╨░╨▓╨╜╨╛' END AS `status_label` FROM ((`equipment` `e` join `organizations` `o` on(`o`.`id` = `e`.`organization_id`)) left join `equipment_categories` `c` on(`c`.`id` = `e`.`category_id`)) ;

-- --------------------------------------------------------

--
-- Структура для представления `v_users_by_organization`
--
DROP TABLE IF EXISTS `v_users_by_organization`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_users_by_organization`  AS SELECT `u`.`id` AS `user_id`, `u`.`organization_id` AS `organization_id`, `o`.`name` AS `organization_name`, `u`.`name` AS `user_name`, `u`.`email` AS `email`, `u`.`role` AS `role`, `u`.`created_at` AS `created_at` FROM (`users` `u` join `organizations` `o` on(`o`.`id` = `u`.`organization_id`)) ;

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bookings_equipment` (`equipment_id`),
  ADD KEY `idx_bookings_user` (`user_id`);

--
-- Индексы таблицы `equipment`
--
ALTER TABLE `equipment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_equipment_organization` (`organization_id`),
  ADD KEY `idx_equipment_category` (`category_id`);

--
-- Индексы таблицы `equipment_categories`
--
ALTER TABLE `equipment_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categories_organization` (`organization_id`);

--
-- Индексы таблицы `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_users_email` (`email`),
  ADD KEY `idx_users_organization` (`organization_id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT для таблицы `equipment`
--
ALTER TABLE `equipment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT для таблицы `equipment_categories`
--
ALTER TABLE `equipment_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `fk_bookings_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`),
  ADD CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ограничения внешнего ключа таблицы `equipment`
--
ALTER TABLE `equipment`
  ADD CONSTRAINT `fk_equipment_category` FOREIGN KEY (`category_id`) REFERENCES `equipment_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_equipment_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`);

--
-- Ограничения внешнего ключа таблицы `equipment_categories`
--
ALTER TABLE `equipment_categories`
  ADD CONSTRAINT `fk_categories_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`);

--
-- Ограничения внешнего ключа таблицы `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
