/**
 * Roles for Lab Equipment Booking SaaS.
 * Values match the MySQL ENUM in users.role.
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
  [ROLES.SYSTEM_ADMIN]: 'System administrator',
  [ROLES.LAB_ADMIN]: 'Lab administrator',
  [ROLES.EQUIPMENT_MANAGER]: 'Equipment manager',
  [ROLES.RESEARCHER]: 'Researcher',
  [ROLES.STUDENT]: 'Student',
  [ROLES.TECHNICIAN]: 'Technician',
};

/** View equipment catalog */
const CAN_VIEW_EQUIPMENT = Object.values(ROLES);

/** Create / update / delete equipment and categories */
const CAN_MANAGE_EQUIPMENT = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.EQUIPMENT_MANAGER,
];

/** Change equipment status (maintenance, broken) */
const CAN_UPDATE_EQUIPMENT_STATUS = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.EQUIPMENT_MANAGER,
  ROLES.TECHNICIAN,
];

/** View bookings */
const CAN_VIEW_BOOKINGS = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.EQUIPMENT_MANAGER,
  ROLES.RESEARCHER,
  ROLES.STUDENT,
  ROLES.TECHNICIAN,
];

/** Create and update bookings */
const CAN_MANAGE_BOOKINGS = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.RESEARCHER,
  ROLES.STUDENT,
];

/** Cancel / delete bookings */
const CAN_DELETE_BOOKINGS = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.RESEARCHER,
];

/** View organizations (system_admin — all, lab_admin — own) */
const CAN_VIEW_ORGANIZATIONS = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
];

/** Admin UI section (users, categories — later) */
const CAN_ACCESS_ADMIN_UI = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
];

/** Create organizations */
const CAN_CREATE_ORGANIZATIONS = [ROLES.SYSTEM_ADMIN];

/** Update organizations (lab_admin restrictions in service) */
const CAN_UPDATE_ORGANIZATIONS = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
];

/** Delete organizations */
const CAN_DELETE_ORGANIZATIONS = [ROLES.SYSTEM_ADMIN];

/** List users (system_admin — all, lab_admin/equipment_manager — own org) */
const CAN_LIST_USERS = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.EQUIPMENT_MANAGER,
];

/** Create users (restrictions in service) */
const CAN_CREATE_USERS = [ROLES.SYSTEM_ADMIN, ROLES.LAB_ADMIN];

/** Update users (detailed rules in usersService) */
const CAN_UPDATE_USERS = Object.values(ROLES);

/** Delete users */
const CAN_DELETE_USERS = [ROLES.SYSTEM_ADMIN, ROLES.LAB_ADMIN];

/** View equipment categories (all roles — own org; system_admin — all) */
const CAN_VIEW_EQUIPMENT_CATEGORIES = Object.values(ROLES);

/** Create / update / delete categories (org restrictions in service) */
const CAN_MANAGE_EQUIPMENT_CATEGORIES = [
  ROLES.SYSTEM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.EQUIPMENT_MANAGER,
];

/** Default role for UI registration */
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
