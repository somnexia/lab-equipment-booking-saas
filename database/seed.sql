-- Тестовые данные Lab Equipment Booking SaaS
-- Пароль для всех демо-пользователей: Password123!
-- 5 учётных записей покрывают 6 ролей; техника можно назначить через UPDATE (см. README).

USE `lab_equipment_booking`;

INSERT INTO `organizations` (`id`, `name`, `description`) VALUES
(1, 'Лаборатория химии', 'Учебно-исследовательская лаборатория органической химии'),
(2, 'Лаборатория физики', 'Лаборатория электроники и измерительных приборов');

INSERT INTO `equipment_categories` (`id`, `organization_id`, `name`, `description`) VALUES
(1, 1, 'Лабораторная посуда', 'Колбы, пробирки, стаканы'),
(2, 1, 'Измерительные приборы', 'Весы, pH-метры'),
(3, 2, 'Электроника', 'Осциллографы, мультиметры');

SET @pwd = '$2b$10$m/FWZv0eTvUl.2FfUf5HL.zbPBL3mjB4CDmmjBT/RYluQTWIJ1jIi';

INSERT INTO `users` (`id`, `organization_id`, `name`, `email`, `password_hash`, `role`) VALUES
(1, 1, 'Сергей Системов', 'admin@lab.local', @pwd, 'system_admin'),
(2, 1, 'Мария Лаборантова', 'lab.admin@chem.lab.local', @pwd, 'lab_admin'),
(3, 1, 'Иван Менеджеров', 'manager@chem.lab.local', @pwd, 'equipment_manager'),
(4, 1, 'Алексей Исследов', 'researcher@chem.lab.local', @pwd, 'researcher'),
(5, 1, 'Пётр Студентов', 'student@chem.lab.local', @pwd, 'student');

INSERT INTO `equipment` (`id`, `organization_id`, `category_id`, `name`, `description`, `status`) VALUES
(1, 1, 1, 'Колба Эрленмейера 250 мл', 'Стеклянная колба для химических опытов', 'available'),
(2, 1, 1, 'Пробирка стеклянная 10 мл', 'Стандартная лабораторная пробирка', 'available'),
(3, 1, 2, 'Аналитические весы', 'Высокоточные лабораторные весы', 'maintenance'),
(4, 2, 3, 'Осциллограф', 'Измерение электрических сигналов', 'available'),
(5, 2, 3, 'Мультиметр', 'Измерение напряжения и тока', 'broken');

INSERT INTO `bookings` (`id`, `equipment_id`, `user_id`, `start_time`, `end_time`, `status`) VALUES
(1, 1, 4, '2026-06-10 09:00:00', '2026-06-10 11:00:00', 'active'),
(2, 2, 5, '2026-06-11 14:00:00', '2026-06-11 16:00:00', 'active'),
(3, 4, 4, '2026-06-12 10:00:00', '2026-06-12 12:00:00', 'completed');
