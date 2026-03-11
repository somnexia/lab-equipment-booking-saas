-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 11, 2026 at 10:23 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lab_equipment_booking`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `equipment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `equipment_id`, `user_id`, `start_time`, `end_time`, `status`, `created_at`) VALUES
(4, 26, 3, '2026-03-12 09:00:00', '2026-03-12 11:00:00', 'active', '2026-03-11 09:20:44'),
(5, 27, 3, '2026-03-13 14:00:00', '2026-03-13 16:00:00', 'completed', '2026-03-11 09:20:44'),
(6, 28, 2, '2026-03-14 10:00:00', '2026-03-14 12:00:00', 'cancelled', '2026-03-11 09:20:44');

-- --------------------------------------------------------

--
-- Table structure for table `equipment`
--

CREATE TABLE `equipment` (
  `id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('available','maintenance','broken') DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `category_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `equipment`
--

INSERT INTO `equipment` (`id`, `organization_id`, `name`, `description`, `status`, `created_at`, `category_id`) VALUES
(26, 1, 'Erlenmeyer Flask 250ml', 'Glass flask used in chemistry experiments', 'available', '2026-03-11 09:19:41', 4),
(27, 1, 'Glass Test Tube', 'Standard 10ml laboratory test tube', 'available', '2026-03-11 09:19:41', 4),
(28, 1, 'Analytical Balance', 'High precision laboratory scale', 'maintenance', '2026-03-11 09:19:41', 5),
(29, 2, 'Oscilloscope', 'Electronic signal measurement device', 'available', '2026-03-11 09:19:41', 6),
(30, 2, 'Multimeter', 'Voltage and current measurement device', 'broken', '2026-03-11 09:19:41', 5),
(31, 1, 'Erlenmeyer Flask 250ml', 'Glass flask used in chemistry experiments', 'available', '2026-03-11 09:20:44', 4),
(32, 1, 'Glass Test Tube', 'Standard 10ml laboratory test tube', 'available', '2026-03-11 09:20:44', 4),
(33, 1, 'Analytical Balance', 'High precision laboratory scale', 'maintenance', '2026-03-11 09:20:44', 5),
(34, 2, 'Oscilloscope', 'Electronic signal measurement device', 'available', '2026-03-11 09:20:44', 6),
(35, 2, 'Multimeter', 'Voltage and current measurement device', 'broken', '2026-03-11 09:20:44', 5);

-- --------------------------------------------------------

--
-- Table structure for table `equipment_categories`
--

CREATE TABLE `equipment_categories` (
  `id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `equipment_categories`
--

INSERT INTO `equipment_categories` (`id`, `organization_id`, `name`, `description`, `created_at`) VALUES
(4, 1, 'Лабораторная посуда', NULL, '2026-03-11 08:53:57'),
(5, 1, 'Измерительные приборы', NULL, '2026-03-11 08:53:57'),
(6, 2, 'Электроника', NULL, '2026-03-11 08:53:57');

-- --------------------------------------------------------

--
-- Table structure for table `organizations`
--

CREATE TABLE `organizations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `description` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `organizations`
--

INSERT INTO `organizations` (`id`, `name`, `created_at`, `description`) VALUES
(1, 'Лаборатория химии', '2026-03-10 12:03:11', 0),
(2, 'Лаборатория физики', '2026-03-10 12:03:11', 0),
(3, 'Лаборатория химии', '2026-03-11 08:53:57', 0),
(4, 'Лаборатория физики', '2026-03-11 08:53:57', 0),
(5, 'Лаборатория химии', '2026-03-11 08:56:22', 0),
(6, 'Лаборатория физики', '2026-03-11 08:56:22', 0),
(7, 'Лаборатория химии', '2026-03-11 08:56:41', 0),
(8, 'Лаборатория физики', '2026-03-11 08:56:41', 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` text DEFAULT NULL,
  `role` enum('admin','manager','user') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `organization_id`, `name`, `email`, `password_hash`, `role`, `created_at`) VALUES
(1, 1, 'Ivan Ivanov', 'ivan@example.com', 'hashed_password1', 'admin', '2026-03-11 09:14:48'),
(2, 1, 'Maria Petrova', 'maria@example.com', 'hashed_password2', 'manager', '2026-03-11 09:14:48'),
(3, 2, 'Alexey Sidorov', 'alex@example.com', 'hashed_password3', 'user', '2026-03-11 09:14:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `equipment_id` (`equipment_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `equipment`
--
ALTER TABLE `equipment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organization_id` (`organization_id`),
  ADD KEY `fk_equipment_category` (`category_id`);

--
-- Indexes for table `equipment_categories`
--
ALTER TABLE `equipment_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organization_id` (`organization_id`);

--
-- Indexes for table `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `organization_id` (`organization_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `equipment`
--
ALTER TABLE `equipment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `equipment_categories`
--
ALTER TABLE `equipment_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `equipment`
--
ALTER TABLE `equipment`
  ADD CONSTRAINT `equipment_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`),
  ADD CONSTRAINT `fk_equipment_category` FOREIGN KEY (`category_id`) REFERENCES `equipment_categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `equipment_categories`
--
ALTER TABLE `equipment_categories`
  ADD CONSTRAINT `equipment_categories_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
