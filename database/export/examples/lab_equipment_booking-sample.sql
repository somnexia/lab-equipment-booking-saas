-- Фрагмент SQL-дампа (пример структуры; полный файл генерируется mysqldump)
-- MySQL dump 10.13  Distrib 8.0.x, for Win64 (x86_64)
--
-- Host: localhost    Database: lab_equipment_booking
-- ------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `lab_equipment_booking` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `lab_equipment_booking`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
CREATE TABLE `organizations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
INSERT INTO `organizations` VALUES (1,'Chemistry Lab','chem-lab','2026-01-15 10:00:00');
UNLOCK TABLES;

-- ... остальные таблицы, процедуры, VIEW — в полном дампе ...
