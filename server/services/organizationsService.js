const db = require('../config/db');
const { ROLES } = require('../config/roles');

function forbidden(message = 'Access denied') {
  const err = new Error(message);
  err.status = 403;
  return err;
}

function notFound(message = 'Organization not found') {
  const err = new Error(message);
  err.status = 404;
  return err;
}

const OrganizationsService = {
  /** Список организаций для формы регистрации (без авторизации). */
  listForRegistration: async () => {
    const [rows] = await db.query(
      'SELECT id, name FROM organizations ORDER BY id'
    );
    return rows;
  },

  getAll: async (actor) => {
    if (actor.role === ROLES.SYSTEM_ADMIN) {
      const [rows] = await db.query(
        'SELECT id, name, description, created_at FROM organizations ORDER BY id'
      );
      return rows;
    }

    if (actor.role === ROLES.LAB_ADMIN) {
      if (!actor.organization_id) throw forbidden('organization_id missing in token');
      const [rows] = await db.query(
        'SELECT id, name, description, created_at FROM organizations WHERE id = ?',
        [actor.organization_id]
      );
      return rows;
    }

    throw forbidden();
  },

  getById: async (id, actor) => {
    const [rows] = await db.query(
      'SELECT id, name, description, created_at FROM organizations WHERE id = ?',
      [id]
    );
    const org = rows[0];
    if (!org) throw notFound();

    if (actor.role === ROLES.SYSTEM_ADMIN) return org;

    if (
      actor.role === ROLES.LAB_ADMIN &&
      Number(actor.organization_id) === Number(org.id)
    ) {
      return org;
    }

    throw forbidden();
  },

  create: async (data, actor) => {
    if (actor.role !== ROLES.SYSTEM_ADMIN) {
      throw forbidden('Only system_admin can create organizations');
    }

    const { name, description = null } = data;
    if (!name || !String(name).trim()) {
      const err = new Error('name is required');
      err.status = 400;
      throw err;
    }

    const [result] = await db.query(
      'INSERT INTO organizations (name, description) VALUES (?, ?)',
      [name.trim(), description]
    );

    return OrganizationsService.getById(result.insertId, actor);
  },

  update: async (id, data, actor) => {
    await OrganizationsService.getById(id, actor);

    if (actor.role === ROLES.LAB_ADMIN) {
      const { name, description } = data;
      await db.query(
        `UPDATE organizations
         SET name = COALESCE(?, name),
             description = COALESCE(?, description)
         WHERE id = ?`,
        [name ?? null, description ?? null, id]
      );
      return OrganizationsService.getById(id, actor);
    }

    if (actor.role === ROLES.SYSTEM_ADMIN) {
      const { name, description } = data;
      await db.query(
        `UPDATE organizations
         SET name = COALESCE(?, name),
             description = COALESCE(?, description)
         WHERE id = ?`,
        [name ?? null, description ?? null, id]
      );
      return OrganizationsService.getById(id, actor);
    }

    throw forbidden();
  },

  delete: async (id, actor) => {
    if (actor.role !== ROLES.SYSTEM_ADMIN) {
      throw forbidden('Only system_admin can delete organizations');
    }

    const [rows] = await db.query('SELECT id FROM organizations WHERE id = ?', [id]);
    if (!rows[0]) throw notFound();

    try {
      await db.query('DELETE FROM organizations WHERE id = ?', [id]);
    } catch (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        const e = new Error(
          'Cannot delete organization: users or related data still exist'
        );
        e.status = 409;
        throw e;
      }
      throw err;
    }

    return { message: `Organization with id ${id} deleted` };
  },
};

module.exports = OrganizationsService;
