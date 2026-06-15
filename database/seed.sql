-- Test data Lab Equipment Booking SaaS
-- Demo password for all users: Password123!
-- 5 accounts cover 6 roles; assign technician via UPDATE (see README).

USE `lab_equipment_booking`;

INSERT INTO `organizations` (`id`, `name`, `description`) VALUES
(1, 'Chemistry Laboratory', 'Teaching and research laboratory for organic chemistry'),
(2, 'Physics Laboratory', 'Electronics and measurement instruments laboratory');

INSERT INTO `equipment_categories` (`id`, `organization_id`, `name`, `description`) VALUES
(1, 1, 'Laboratory glassware', 'Flasks, test tubes, beakers'),
(2, 1, 'Measuring instruments', 'Scales, pH meters'),
(3, 2, 'Electronics', 'Oscilloscopes, multimeters');

SET @pwd = '$2b$10$m/FWZv0eTvUl.2FfUf5HL.zbPBL3mjB4CDmmjBT/RYluQTWIJ1jIi';

INSERT INTO `users` (`id`, `organization_id`, `name`, `email`, `password_hash`, `role`) VALUES
(1, 1, 'Sergey Systemov', 'admin@lab.local', @pwd, 'system_admin'),
(2, 1, 'Maria Labadminova', 'lab.admin@chem.lab.local', @pwd, 'lab_admin'),
(3, 1, 'Ivan Managerov', 'manager@chem.lab.local', @pwd, 'equipment_manager'),
(4, 1, 'Alexey Researcher', 'researcher@chem.lab.local', @pwd, 'researcher'),
(5, 1, 'Peter Studentov', 'student@chem.lab.local', @pwd, 'student');

INSERT INTO `equipment` (`id`, `organization_id`, `category_id`, `name`, `description`, `status`) VALUES
(1, 1, 1, 'Erlenmeyer flask 250 ml', 'Glass flask for chemistry experiments', 'available'),
(2, 1, 1, 'Glass test tube 10 ml', 'Standard laboratory test tube', 'available'),
(3, 1, 2, 'Analytical balance', 'High-precision laboratory scale', 'maintenance'),
(4, 2, 3, 'Oscilloscope', 'Electrical signal measurement', 'available'),
(5, 2, 3, 'Multimeter', 'Voltage and current measurement', 'broken');

INSERT INTO `bookings` (`id`, `equipment_id`, `user_id`, `start_time`, `end_time`, `status`) VALUES
(1, 1, 4, '2026-06-10 09:00:00', '2026-06-10 11:00:00', 'active'),
(2, 2, 5, '2026-06-11 14:00:00', '2026-06-11 16:00:00', 'active'),
(3, 4, 4, '2026-06-12 10:00:00', '2026-06-12 12:00:00', 'completed');
