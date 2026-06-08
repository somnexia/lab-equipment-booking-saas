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

async function fetchById(id) {
  const [rows] = await db.query(
    'SELECT * FROM v_equipment_catalog WHERE equipment_id = ?',
    [id]
  );
  return rows[0];
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

const EquipmentService = {
  getAll: async (actor) => {
    if (actor.role === ROLES.SYSTEM_ADMIN) {
      const [rows] = await db.query(
        'SELECT * FROM v_equipment_catalog ORDER BY equipment_id'
      );
      return rows;
    }

    assertOrgInToken(actor);
    const [rows] = await db.query(
      'SELECT * FROM v_equipment_catalog WHERE organization_id = ? ORDER BY equipment_id',
      [actor.organization_id]
    );
    return rows;
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
      if (!VALID_STATUSES.includes(status)) badRequest('invalid status');

      await db.query('CALL sp_update_equipment_status(?, ?, ?, ?)', [
        id,
        status,
        actor.id,
        actor.role,
      ]);
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
      if (!VALID_STATUSES.includes(status)) badRequest('invalid status');
      await db.query('CALL sp_update_equipment_status(?, ?, ?, ?)', [
        id,
        status,
        actor.id,
        actor.role,
      ]);
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

    try {
      await db.query('DELETE FROM equipment WHERE id = ?', [id]);
    } catch (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        const e = new Error('Cannot delete equipment: related bookings exist');
        e.status = 409;
        throw e;
      }
      throw err;
    }

    return { message: `Equipment with id ${id} deleted` };
  },
};

module.exports = EquipmentService;
