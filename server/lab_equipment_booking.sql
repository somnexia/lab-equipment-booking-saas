-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: lab_equipment_booking
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equipment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_bookings_equipment` (`equipment_id`),
  KEY `idx_bookings_user` (`user_id`),
  CONSTRAINT `fk_bookings_equipment` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`),
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,4,'2026-06-10 09:00:00','2026-06-10 11:00:00','completed','2026-06-03 10:51:28'),(2,2,5,'2026-06-11 14:00:00','2026-06-11 16:00:00','completed','2026-06-03 10:51:28'),(3,4,4,'2026-06-12 10:00:00','2026-06-12 12:00:00','completed','2026-06-03 10:51:28'),(4,1,1,'2026-06-14 23:00:00','2026-06-15 01:00:00','completed','2026-06-14 19:45:22'),(5,1,1,'2026-06-16 00:00:00','2026-06-30 02:00:00','cancelled','2026-06-14 20:22:52'),(6,2,5,'2026-06-15 00:00:00','2026-06-15 02:00:00','completed','2026-06-14 20:51:29'),(7,2,5,'2026-06-18 00:00:00','2026-06-24 02:00:00','completed','2026-06-14 20:51:55'),(8,1,1,'2026-06-15 00:00:00','2026-06-26 02:00:00','completed','2026-06-14 20:55:08'),(9,6,4,'2026-06-17 00:00:00','2026-06-23 02:00:00','completed','2026-06-14 20:58:38'),(10,3,1,'2026-06-15 01:00:00','2026-06-17 03:00:00','completed','2026-06-14 21:04:21'),(11,7,1,'2026-06-15 01:00:00','2026-06-19 03:00:00','completed','2026-06-14 21:33:27'),(12,4,7,'2026-06-16 13:00:00','2026-06-19 15:00:00','completed','2026-06-15 09:49:24'),(13,1,5,'2026-06-15 10:00:00','2026-06-15 12:00:00','completed','2026-06-17 09:58:25'),(14,2,5,'2026-06-15 10:00:00','2026-06-15 12:00:00','completed','2026-06-17 09:59:01'),(15,6,5,'2026-06-15 10:00:00','2026-06-15 12:00:00','completed','2026-06-17 10:01:35'),(16,1,5,'2026-06-15 10:00:00','2026-06-15 12:00:00','active','2026-06-17 10:12:17'),(17,1,1,'2026-06-17 14:00:00','2026-06-28 16:00:00','active','2026-06-17 10:29:11'),(18,3,1,'2026-06-17 14:00:00','2026-06-19 16:00:00','active','2026-06-17 10:29:37');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipment`
--

DROP TABLE IF EXISTS `equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `equipment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('available','maintenance','broken') NOT NULL DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_equipment_organization` (`organization_id`),
  KEY `idx_equipment_category` (`category_id`),
  CONSTRAINT `fk_equipment_category` FOREIGN KEY (`category_id`) REFERENCES `equipment_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_equipment_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipment`
--

LOCK TABLES `equipment` WRITE;
/*!40000 ALTER TABLE `equipment` DISABLE KEYS */;
INSERT INTO `equipment` VALUES (1,1,1,'Колба Эрленмейера 250 мл','Стеклянная колба для химических опытов','available','2026-06-03 10:51:28'),(2,1,1,'Пробирка стеклянная 10 мл','Стандартная лабораторная пробирка','available','2026-06-03 10:51:28'),(3,1,2,'Аналитические весы','Высокоточные лабораторные весы','available','2026-06-03 10:51:28'),(4,2,3,'Осциллограф','Измерение электрических сигналов','available','2026-06-03 10:51:28'),(5,2,3,'Мультиметр','Измерение напряжения и тока','available','2026-06-03 10:51:28'),(6,1,1,'Прибор от manager','org 1','available','2026-06-08 19:31:56'),(7,1,1,'Пробирка стеклянная 20 мл','Пробирка стеклянная 10 мл','available','2026-06-14 21:33:16');
/*!40000 ALTER TABLE `equipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipment_categories`
--

DROP TABLE IF EXISTS `equipment_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `equipment_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_categories_organization` (`organization_id`),
  CONSTRAINT `fk_categories_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipment_categories`
--

LOCK TABLES `equipment_categories` WRITE;
/*!40000 ALTER TABLE `equipment_categories` DISABLE KEYS */;
INSERT INTO `equipment_categories` VALUES (1,1,'Лабораторная посуда','Колбы, пробирки, стаканы','2026-06-03 10:51:28'),(2,1,'Измерительные приборы','Весы, pH-метры','2026-06-03 10:51:28'),(3,2,'Электроника','Осциллографы, мультиметры','2026-06-03 10:51:28');
/*!40000 ALTER TABLE `equipment_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organizations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'Лаборатория химии','Обновлено system_admin','2026-06-03 10:51:28'),(2,'Лаборатория физики','Лаборатория электроники и измерительных приборов','2026-06-03 10:51:28');
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` text NOT NULL,
  `role` enum('system_admin','lab_admin','equipment_manager','researcher','student','technician') NOT NULL DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_organization` (`organization_id`),
  CONSTRAINT `fk_users_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'Сергей Системов','admin@lab.local','$2b$10$m/FWZv0eTvUl.2FfUf5HL.zbPBL3mjB4CDmmjBT/RYluQTWIJ1jIi','system_admin','2026-06-03 10:51:28'),(2,1,'Мария Лаборантова','lab.admin@chem.lab.local','$2b$10$m/FWZv0eTvUl.2FfUf5HL.zbPBL3mjB4CDmmjBT/RYluQTWIJ1jIi','lab_admin','2026-06-03 10:51:28'),(3,1,'Иван Менеджеров','manager@chem.lab.local','$2b$10$m/FWZv0eTvUl.2FfUf5HL.zbPBL3mjB4CDmmjBT/RYluQTWIJ1jIi','equipment_manager','2026-06-03 10:51:28'),(4,1,'Алексей Исследов','researcher@chem.lab.local','$2b$10$m/FWZv0eTvUl.2FfUf5HL.zbPBL3mjB4CDmmjBT/RYluQTWIJ1jIi','researcher','2026-06-03 10:51:28'),(5,1,'Пётр Студентов','student@chem.lab.local','$2b$10$m/FWZv0eTvUl.2FfUf5HL.zbPBL3mjB4CDmmjBT/RYluQTWIJ1jIi','student','2026-06-03 10:51:28'),(6,1,'Тестовый Техник','tech.test@chem.lab.local','$2b$10$rUiFgoUon2Y.PO33SOLVu.4f9siHmrh7IerqdZuNGVcpk0kKP1pmu','technician','2026-06-14 21:00:47'),(7,2,'testuser','testuser@mail.com','$2b$10$46t8SDTmLXmi/.DQ7OeN0emsdIC4nrLJlNPNcufRgo8XAdzYsJJSe','student','2026-06-15 09:47:55'),(8,1,'gg','qqq@mail.com','$2b$10$hRdNTsTyburHnELU4JZzB.uOhC4PiIG4EFRYtpqP50RYfNtNXlbJm','student','2026-09-24 15:08:12');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `v_active_bookings`
--

DROP TABLE IF EXISTS `v_active_bookings`;
/*!50001 DROP VIEW IF EXISTS `v_active_bookings`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_active_bookings` AS SELECT
 1 AS `booking_id`,
  1 AS `equipment_id`,
  1 AS `equipment_name`,
  1 AS `user_id`,
  1 AS `user_name`,
  1 AS `organization_id`,
  1 AS `organization_name`,
  1 AS `start_time`,
  1 AS `end_time`,
  1 AS `created_at` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_bookings_detail`
--

DROP TABLE IF EXISTS `v_bookings_detail`;
/*!50001 DROP VIEW IF EXISTS `v_bookings_detail`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_bookings_detail` AS SELECT
 1 AS `booking_id`,
  1 AS `equipment_id`,
  1 AS `equipment_name`,
  1 AS `equipment_status`,
  1 AS `user_id`,
  1 AS `user_name`,
  1 AS `user_email`,
  1 AS `user_role`,
  1 AS `organization_id`,
  1 AS `organization_name`,
  1 AS `start_time`,
  1 AS `end_time`,
  1 AS `booking_status`,
  1 AS `created_at`,
  1 AS `booking_status_label` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_equipment_catalog`
--

DROP TABLE IF EXISTS `v_equipment_catalog`;
/*!50001 DROP VIEW IF EXISTS `v_equipment_catalog`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_equipment_catalog` AS SELECT
 1 AS `equipment_id`,
  1 AS `organization_id`,
  1 AS `organization_name`,
  1 AS `category_id`,
  1 AS `category_name`,
  1 AS `equipment_name`,
  1 AS `description`,
  1 AS `status`,
  1 AS `created_at`,
  1 AS `status_label` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_users_by_organization`
--

DROP TABLE IF EXISTS `v_users_by_organization`;
/*!50001 DROP VIEW IF EXISTS `v_users_by_organization`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_users_by_organization` AS SELECT
 1 AS `user_id`,
  1 AS `organization_id`,
  1 AS `organization_name`,
  1 AS `user_name`,
  1 AS `email`,
  1 AS `role`,
  1 AS `created_at` */;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_active_bookings`
--

/*!50001 DROP VIEW IF EXISTS `v_active_bookings`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp866 */;
/*!50001 SET character_set_results     = cp866 */;
/*!50001 SET collation_connection      = cp866_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_active_bookings` AS select `v_bookings_detail`.`booking_id` AS `booking_id`,`v_bookings_detail`.`equipment_id` AS `equipment_id`,`v_bookings_detail`.`equipment_name` AS `equipment_name`,`v_bookings_detail`.`user_id` AS `user_id`,`v_bookings_detail`.`user_name` AS `user_name`,`v_bookings_detail`.`organization_id` AS `organization_id`,`v_bookings_detail`.`organization_name` AS `organization_name`,`v_bookings_detail`.`start_time` AS `start_time`,`v_bookings_detail`.`end_time` AS `end_time`,`v_bookings_detail`.`created_at` AS `created_at` from `v_bookings_detail` where `v_bookings_detail`.`booking_status` = 'active' */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_bookings_detail`
--

/*!50001 DROP VIEW IF EXISTS `v_bookings_detail`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp866 */;
/*!50001 SET character_set_results     = cp866 */;
/*!50001 SET collation_connection      = cp866_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_bookings_detail` AS select `b`.`id` AS `booking_id`,`b`.`equipment_id` AS `equipment_id`,`e`.`name` AS `equipment_name`,`e`.`status` AS `equipment_status`,`b`.`user_id` AS `user_id`,`u`.`name` AS `user_name`,`u`.`email` AS `user_email`,`u`.`role` AS `user_role`,`u`.`organization_id` AS `organization_id`,`o`.`name` AS `organization_name`,`b`.`start_time` AS `start_time`,`b`.`end_time` AS `end_time`,`b`.`status` AS `booking_status`,`b`.`created_at` AS `created_at`,case `b`.`status` when 'active' then 'Active' when 'completed' then 'Completed' when 'cancelled' then 'Cancelled' end AS `booking_status_label` from (((`bookings` `b` join `users` `u` on(`u`.`id` = `b`.`user_id`)) join `equipment` `e` on(`e`.`id` = `b`.`equipment_id`)) join `organizations` `o` on(`o`.`id` = `u`.`organization_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_equipment_catalog`
--

/*!50001 DROP VIEW IF EXISTS `v_equipment_catalog`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp866 */;
/*!50001 SET character_set_results     = cp866 */;
/*!50001 SET collation_connection      = cp866_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_equipment_catalog` AS select `e`.`id` AS `equipment_id`,`e`.`organization_id` AS `organization_id`,`o`.`name` AS `organization_name`,`e`.`category_id` AS `category_id`,`c`.`name` AS `category_name`,`e`.`name` AS `equipment_name`,`e`.`description` AS `description`,`e`.`status` AS `status`,`e`.`created_at` AS `created_at`,case `e`.`status` when 'available' then 'Available for booking' when 'maintenance' then 'Maintenance' when 'broken' then 'Broken' end AS `status_label` from ((`equipment` `e` join `organizations` `o` on(`o`.`id` = `e`.`organization_id`)) left join `equipment_categories` `c` on(`c`.`id` = `e`.`category_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_users_by_organization`
--

/*!50001 DROP VIEW IF EXISTS `v_users_by_organization`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = cp866 */;
/*!50001 SET character_set_results     = cp866 */;
/*!50001 SET collation_connection      = cp866_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_users_by_organization` AS select `u`.`id` AS `user_id`,`u`.`organization_id` AS `organization_id`,`o`.`name` AS `organization_name`,`u`.`name` AS `user_name`,`u`.`email` AS `email`,`u`.`role` AS `role`,`u`.`created_at` AS `created_at` from (`users` `u` join `organizations` `o` on(`o`.`id` = `u`.`organization_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-24 20:00:54
