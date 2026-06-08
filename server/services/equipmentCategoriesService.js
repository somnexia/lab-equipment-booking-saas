const db = require('../config/db');
const { ROLES } = require('../config/roles');

const SELECT_FIELDS = `
  c.id,
  c.organization_id,
  o.name AS organization_name,
  c.name,
  c.description,
  c.created_at
`;

const FROM_JOIN = `
  FROM equipment_categories c
  INNER JOIN organizations o ON o.id = c.organization_id
`;

function forbidden(message = 'Access denied') {
  const err = new Error(message);
  err.status = 403;
  return err;
}

function notFound(message = 'Category not found') {
  const err = new Error(message);
  err.status = 404;
  return err;
}

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  throw err;
}

function canManage(actor) {
  return (
    actor.role === ROLES.SYSTEM_ADMIN ||
    actor.role === ROLES.LAB_ADMIN ||
    actor.role === ROLES.EQUIPMENT_MANAGER
  );
}

function assertOrgInToken(actor) {
  if (!actor.organization_id) {
    throw forbidden('organization_id missing in token');
  }
}

function assertCanReadCategory(category, actor) {
  if (actor.role === ROLES.SYSTEM_ADMIN) return;
  assertOrgInToken(actor);
  if (Number(actor.organization_id) === Number(category.organization_id)) return;
  throw forbidden();
}

function assertCanManageCategory(category, actor) {
  if (!canManage(actor)) throw forbidden();
  if (actor.role === ROLES.SYSTEM_ADMIN) return;
  assertOrgInToken(actor);
  if (Number(actor.organization_id) === Number(category.organization_id)) return;
  throw forbidden();
}

async function fetchById(id) {
  const [rows] = await db.query(
    `SELECT ${SELECT_FIELDS} ${FROM_JOIN} WHERE c.id = ?`,
    [id]
  );
  return rows[0];
}

const EquipmentCategoriesService = {
  getAll: async (actor) => {
    if (actor.role === ROLES.SYSTEM_ADMIN) {
      const [rows] = await db.query(
        `SELECT ${SELECT_FIELDS} ${FROM_JOIN} ORDER BY c.id`
      );
      return rows;
    }

    assertOrgInToken(actor);
    const [rows] = await db.query(
      `SELECT ${SELECT_FIELDS} ${FROM_JOIN} WHERE c.organization_id = ? ORDER BY c.id`,
      [actor.organization_id]
    );
    return rows;
  },

  getById: async (id, actor) => {
    const category = await fetchById(id);
    if (!category) throw notFound();
    assertCanReadCategory(category, actor);
    return category;
  },

  create: async (data, actor) => {
    if (!canManage(actor)) {
      throw forbidden('Only system_admin, lab_admin or equipment_manager can create categories');
    }

    const { name, description = null } = data;
    if (!name?.trim()) badRequest('name is required');

    let organization_id = data.organization_id;
    if (actor.role === ROLES.SYSTEM_ADMIN) {
      if (!organization_id) badRequest('organization_id is required');
    } else {
      assertOrgInToken(actor);
      organization_id = actor.organization_id;
    }

    const [result] = await db.query(
      `INSERT INTO equipment_categories (organization_id, name, description)
       VALUES (?, ?, ?)`,
      [organization_id, name.trim(), description]
    );

    return EquipmentCategoriesService.getById(result.insertId, actor);
  },

  update: async (id, data, actor) => {
    const [rows] = await db.query(
      'SELECT id, organization_id FROM equipment_categories WHERE id = ?',
      [id]
    );
    const existing = rows[0];
    if (!existing) throw notFound();
    assertCanManageCategory(existing, actor);

    const { name, description } = data;
    await db.query(
      `UPDATE equipment_categories
       SET name = COALESCE(?, name),
           description = COALESCE(?, description)
       WHERE id = ?`,
      [name ?? null, description ?? null, id]
    );

    return EquipmentCategoriesService.getById(id, actor);
  },

  delete: async (id, actor) => {
    const [rows] = await db.query(
      'SELECT id, organization_id FROM equipment_categories WHERE id = ?',
      [id]
    );
    const existing = rows[0];
    if (!existing) throw notFound();
    assertCanManageCategory(existing, actor);

    await db.query('DELETE FROM equipment_categories WHERE id = ?', [id]);
    return { message: `Category with id ${id} deleted` };
  },
};

module.exports = EquipmentCategoriesService;
