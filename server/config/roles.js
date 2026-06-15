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

/** Просмотр организаций (system_admin — все, lab_admin — своя) */
const CAN_VIEW_ORGANIZATIONS = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
];

/** Раздел Admin в UI (пользователи, категории — позже) */
const CAN_ACCESS_ADMIN_UI = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
];

/** Создание организаций */
const CAN_CREATE_ORGANIZATIONS = [ROLES.SYSTEM_ADMIN];

/** Изменение организаций (ограничения в сервисе для lab_admin) */
const CAN_UPDATE_ORGANIZATIONS = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
];

/** Удаление организаций */
const CAN_DELETE_ORGANIZATIONS = [ROLES.SYSTEM_ADMIN];

/** Список пользователей (system_admin — все, lab_admin/equipment_manager — своя орг.) */
const CAN_LIST_USERS = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.EQUIPMENT_MANAGER,
];

/** Создание пользователей (ограничения в сервисе) */
const CAN_CREATE_USERS = [ROLES.SYSTEM_ADMIN, ROLES.LAB_ADMIN];

/** Изменение пользователей (детальные правила в usersService) */
const CAN_UPDATE_USERS = Object.values(ROLES);

/** Удаление пользователей */
const CAN_DELETE_USERS = [ROLES.SYSTEM_ADMIN, ROLES.LAB_ADMIN];

/** Просмотр категорий оборудования (все роли — своя org; system_admin — все) */
const CAN_VIEW_EQUIPMENT_CATEGORIES = Object.values(ROLES);

/** Создание / изменение / удаление категорий (ограничения по org в сервисе) */
const CAN_MANAGE_EQUIPMENT_CATEGORIES = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.EQUIPMENT_MANAGER,
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
  CAN_VIEW_ORGANIZATIONS,
  CAN_ACCESS_ADMIN_UI,
  CAN_CREATE_ORGANIZATIONS,
  CAN_UPDATE_ORGANIZATIONS,
  CAN_DELETE_ORGANIZATIONS,
  CAN_LIST_USERS,
  CAN_CREATE_USERS,
  CAN_UPDATE_USERS,
  CAN_DELETE_USERS,
  CAN_VIEW_EQUIPMENT_CATEGORIES,
  CAN_MANAGE_EQUIPMENT_CATEGORIES,
  DEFAULT_REGISTER_ROLE,
};
