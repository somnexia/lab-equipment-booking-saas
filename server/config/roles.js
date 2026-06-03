/**
 * Роли информационной системы Lab Equipment Booking SaaS.
 * Значения совпадают с ENUM в MySQL (users.role).
 */
const ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  LAB_ADMIN: 'lab_admin',
  EQUIPMENT_MANAGER: 'equipment_manager',
  RESEARCHER: 'researcher',
  STUDENT: 'student',
  TECHNICIAN: 'technician',
};

const ROLE_LABELS = {
  [ROLES.SYSTEM_ADMIN]: 'Системный администратор',
  [ROLES.LAB_ADMIN]: 'Администратор лаборатории',
  [ROLES.EQUIPMENT_MANAGER]: 'Менеджер оборудования',
  [ROLES.RESEARCHER]: 'Исследователь',
  [ROLES.STUDENT]: 'Студент',
  [ROLES.TECHNICIAN]: 'Техник',
};

/** Просмотр каталога оборудования */
const CAN_VIEW_EQUIPMENT = Object.values(ROLES);

/** Создание / изменение / удаление оборудования и категорий */
const CAN_MANAGE_EQUIPMENT = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.EQUIPMENT_MANAGER,
];

/** Смена статуса оборудования (maintenance, broken) */
const CAN_UPDATE_EQUIPMENT_STATUS = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.EQUIPMENT_MANAGER,
  ROLES.TECHNICIAN,
];

/** Просмотр бронирований */
const CAN_VIEW_BOOKINGS = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.EQUIPMENT_MANAGER,
  ROLES.RESEARCHER,
  ROLES.STUDENT,
  ROLES.TECHNICIAN,
];

/** Создание и изменение бронирований */
const CAN_MANAGE_BOOKINGS = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.RESEARCHER,
  ROLES.STUDENT,
];

/** Отмена / удаление бронирований */
const CAN_DELETE_BOOKINGS = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.RESEARCHER,
];

/** Роль по умолчанию при регистрации через UI */
const DEFAULT_REGISTER_ROLE = ROLES.STUDENT;

module.exports = {
  ROLES,
  ROLE_LABELS,
  CAN_VIEW_EQUIPMENT,
  CAN_MANAGE_EQUIPMENT,
  CAN_UPDATE_EQUIPMENT_STATUS,
  CAN_VIEW_BOOKINGS,
  CAN_MANAGE_BOOKINGS,
  CAN_DELETE_BOOKINGS,
  DEFAULT_REGISTER_ROLE,
};
