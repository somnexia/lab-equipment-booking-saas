const db = require('../config/db');
const { ROLES } = require('../config/roles');

const VALID_STATUSES = ['available', 'maintenance', 'broken'];

function forbidden(message = 'Access denied') {
  const err = new Error(message);
  err.status = 403;
  return err;
}

function notFound(message = 'Equipment not found') {
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

function assertCanRead(equipment, actor) {
  if (actor.role === ROLES.SYSTEM_ADMIN) return;
  assertOrgInToken(actor);
  if (Number(actor.organization_id) === Number(equipment.organization_id)) return;
  throw forbidden();
}

function parseListFilters(query = {}) {
  const filters = {};

  if (query.bookable === 'true' || query.bookable === '1') {
    filters.status = 'available';
  }

  if (query.status) {
    if (!VALID_STATUSES.includes(query.status)) {
      badRequest('invalid status filter');
    }
    filters.status = query.status;
  }

  if (query.category_id !== undefined && query.category_id !== '') {
    const categoryId = Number(query.category_id);
    if (Number.isNaN(categoryId)) badRequest('invalid category_id');
    filters.category_id = categoryId;
  }

  if (query.q?.trim()) {
    filters.q = query.q.trim();
  }

  return filters;
}

async function fetchById(id) {
  const [rows] = await db.query(
    'SELECT * FROM v_equipment_catalog WHERE equipment_id = ?',
    [id]
  );
  return rows[0];
}

async function queryCatalog(actor, filters = {}) {
  const conditions = [];
  const params = [];

  if (actor.role !== ROLES.SYSTEM_ADMIN) {
    assertOrgInToken(actor);
    conditions.push('organization_id = ?');
    params.push(actor.organization_id);
  }

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters.category_id) {
    conditions.push('category_id = ?');
    params.push(filters.category_id);
  }

  if (filters.q) {
    conditions.push('(equipment_name LIKE ? OR description LIKE ?)');
    const like = `%${filters.q}%`;
    params.push(like, like);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.query(
    `SELECT * FROM v_equipment_catalog ${where} ORDER BY equipment_id`,
    params
  );
  return rows;
}

async function validateCategory(categoryId, organizationId) {
  if (categoryId === undefined || categoryId === null || categoryId === '') {
    return;
  }

  const [rows] = await db.query(
    'SELECT organization_id FROM equipment_categories WHERE id = ?',
    [categoryId]
  );

  if (!rows[0]) {
    const err = new Error('Category not found');
    err.status = 404;
    throw err;
  }

  if (Number(rows[0].organization_id) !== Number(organizationId)) {
    throw forbidden('Category does not belong to equipment organization');
  }
}

async function applyStatusChange(id, status, actor) {
  if (!VALID_STATUSES.includes(status)) badRequest('invalid status');
  await db.query('CALL sp_update_equipment_status(?, ?, ?, ?)', [
    id,
    status,
    actor.id,
    actor.role,
  ]);
}

async function assertCanDeleteEquipment(equipmentId) {
  const [rows] = await db.query(
    `SELECT
       SUM(status = 'active') AS active_cnt,
       COUNT(*) AS total_cnt
     FROM bookings
     WHERE equipment_id = ?`,
    [equipmentId]
  );

  const activeCnt = Number(rows[0]?.active_cnt || 0);
  const totalCnt = Number(rows[0]?.total_cnt || 0);

  if (activeCnt > 0) {
    const err = new Error('Cannot delete equipment: active bookings exist');
    err.status = 409;
    throw err;
  }

  if (totalCnt > 0) {
    const err = new Error('Cannot delete equipment: booking history exists');
    err.status = 409;
    throw err;
  }
}

const EquipmentService = {
  getAll: async (actor, query = {}) => {
    const filters = parseListFilters(query);
    return queryCatalog(actor, filters);
  },

  getAvailable: async (actor, query = {}) => {
    const filters = parseListFilters({ ...query, bookable: 'true' });
    return queryCatalog(actor, filters);
  },

  getById: async (id, actor) => {
    const equipment = await fetchById(id);
    if (!equipment) throw notFound();
    assertCanRead(equipment, actor);
    return equipment;
  },

  create: async (data, actor) => {
    if (!canManage(actor)) {
      throw forbidden('Only system_admin, lab_admin or equipment_manager can create equipment');
    }

    const { name, category_id, description, status = 'available' } = data;
    if (!name?.trim()) badRequest('name is required');
    if (!VALID_STATUSES.includes(status)) badRequest('invalid status');

    let organization_id = data.organization_id;
    if (actor.role === ROLES.SYSTEM_ADMIN) {
      if (!organization_id) badRequest('organization_id is required');
    } else {
      assertOrgInToken(actor);
      organization_id = actor.organization_id;
    }

    await validateCategory(category_id, organization_id);

    const [result] = await db.query(
      `INSERT INTO equipment (organization_id, name, category_id, description, status)
       VALUES (?, ?, ?, ?, ?)`,
      [organization_id, name.trim(), category_id ?? null, description ?? null, status]
    );

    return EquipmentService.getById(result.insertId, actor);
  },

  updateStatus: async (id, status, actor) => {
    const existing = await fetchById(id);
    if (!existing) throw notFound();
    assertCanRead(existing, actor);

    if (!status) badRequest('status is required');
    await applyStatusChange(id, status, actor);
    return EquipmentService.getById(id, actor);
  },

  update: async (id, data, actor) => {
    const existing = await fetchById(id);
    if (!existing) throw notFound();
    assertCanRead(existing, actor);

    const { name, category_id, description, status } = data;
    const isTechnician = actor.role === ROLES.TECHNICIAN;

    if (isTechnician) {
      if (
        name !== undefined ||
        category_id !== undefined ||
        description !== undefined
      ) {
        throw forbidden('Technician can only update status');
      }
      if (status === undefined) {
        return existing;
      }
      await applyStatusChange(id, status, actor);
      return EquipmentService.getById(id, actor);
    }

    if (!canManage(actor)) {
      throw forbidden();
    }

    if (category_id !== undefined) {
      await validateCategory(category_id, existing.organization_id);
    }

    if (
      name !== undefined ||
      category_id !== undefined ||
      description !== undefined
    ) {
      await db.query(
        `UPDATE equipment
         SET name = COALESCE(?, name),
             category_id = COALESCE(?, category_id),
             description = COALESCE(?, description)
         WHERE id = ?`,
        [name ?? null, category_id ?? null, description ?? null, id]
      );
    }

    if (status !== undefined) {
      await applyStatusChange(id, status, actor);
    }

    return EquipmentService.getById(id, actor);
  },

  delete: async (id, actor) => {
    if (!canManage(actor)) {
      throw forbidden('Only system_admin, lab_admin or equipment_manager can delete equipment');
    }

    const existing = await fetchById(id);
    if (!existing) throw notFound();

    if (actor.role !== ROLES.SYSTEM_ADMIN) {
      assertCanRead(existing, actor);
    }

    await assertCanDeleteEquipment(id);

    await db.query('DELETE FROM equipment WHERE id = ?', [id]);
    return { message: `Equipment with id ${id} deleted` };
  },
};

module.exports = EquipmentService;
