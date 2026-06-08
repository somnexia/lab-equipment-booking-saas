const db = require('../config/db');
const bcrypt = require('bcrypt');
const { ROLES, DEFAULT_REGISTER_ROLE } = require('../config/roles');

const ALL_ROLES = Object.values(ROLES);

function forbidden(message = 'Access denied') {
  const err = new Error(message);
  err.status = 403;
  return err;
}

function notFound(message = 'User not found') {
  const err = new Error(message);
  err.status = 404;
  return err;
}

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  throw err;
}

function sanitizeUser(row) {
  if (!row) return null;
  return {
    id: row.user_id ?? row.id,
    organization_id: row.organization_id,
    organization_name: row.organization_name ?? undefined,
    name: row.user_name ?? row.name,
    email: row.email,
    role: row.role,
    created_at: row.created_at,
  };
}

function isSelf(actor, userId) {
  return Number(actor.id) === Number(userId);
}

function canListUsers(actor) {
  return (
    actor.role === ROLES.SYSTEM_ADMIN ||
    actor.role === ROLES.LAB_ADMIN ||
    actor.role === ROLES.EQUIPMENT_MANAGER
  );
}

function canAssignRole(actor, role) {
  if (!ALL_ROLES.includes(role)) return false;
  if (role === ROLES.SYSTEM_ADMIN && actor.role !== ROLES.SYSTEM_ADMIN) {
    return false;
  }
  return true;
}

const UsersService = {
  getAll: async (actor) => {
    if (!canListUsers(actor)) throw forbidden();

    if (actor.role === ROLES.SYSTEM_ADMIN) {
      const [rows] = await db.query(
        'SELECT * FROM v_users_by_organization ORDER BY user_id'
      );
      return rows.map(sanitizeUser);
    }

    if (!actor.organization_id) {
      throw forbidden('organization_id missing in token');
    }

    const [rows] = await db.query(
      'SELECT * FROM v_users_by_organization WHERE organization_id = ? ORDER BY user_id',
      [actor.organization_id]
    );
    return rows.map(sanitizeUser);
  },

  getById: async (id, actor) => {
    const [rows] = await db.query(
      'SELECT * FROM v_users_by_organization WHERE user_id = ?',
      [id]
    );
    const row = rows[0];
    if (!row) throw notFound();

    if (actor.role === ROLES.SYSTEM_ADMIN) return sanitizeUser(row);

    if (
      actor.role === ROLES.LAB_ADMIN ||
      actor.role === ROLES.EQUIPMENT_MANAGER
    ) {
      if (Number(actor.organization_id) === Number(row.organization_id)) {
        return sanitizeUser(row);
      }
      throw forbidden();
    }

    if (isSelf(actor, row.user_id)) return sanitizeUser(row);

    throw forbidden();
  },

  getMe: async (actor) => UsersService.getById(actor.id, actor),

  create: async (data, actor) => {
    if (
      actor.role !== ROLES.SYSTEM_ADMIN &&
      actor.role !== ROLES.LAB_ADMIN
    ) {
      throw forbidden('Only system_admin or lab_admin can create users');
    }

    const { name, email, password } = data;
    if (!name?.trim() || !email?.trim() || !password) {
      badRequest('name, email and password are required');
    }

    let organization_id = data.organization_id;
    let role = data.role || DEFAULT_REGISTER_ROLE;

    if (actor.role === ROLES.LAB_ADMIN) {
      organization_id = actor.organization_id;
      if (!organization_id) throw forbidden('organization_id missing in token');
    } else if (!organization_id) {
      badRequest('organization_id is required');
    }

    if (!canAssignRole(actor, role)) {
      throw forbidden(`Cannot assign role: ${role}`);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const [result] = await db.query(
        `INSERT INTO users (organization_id, name, email, password_hash, role)
         VALUES (?, ?, ?, ?, ?)`,
        [organization_id, name.trim(), email.trim().toLowerCase(), passwordHash, role]
      );
      return UsersService.getById(result.insertId, actor);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const e = new Error('Email already exists');
        e.status = 409;
        throw e;
      }
      throw err;
    }
  },

  update: async (id, data, actor) => {
    const [rows] = await db.query(
      'SELECT id, organization_id, name, email, role FROM users WHERE id = ?',
      [id]
    );
    const target = rows[0];
    if (!target) throw notFound();

    const self = isSelf(actor, id);

    if (actor.role === ROLES.SYSTEM_ADMIN) {
      // all fields allowed below
    } else if (actor.role === ROLES.LAB_ADMIN) {
      if (Number(actor.organization_id) !== Number(target.organization_id)) {
        throw forbidden();
      }
      if (target.role === ROLES.SYSTEM_ADMIN && !self) {
        throw forbidden('Cannot modify system_admin user');
      }
    } else if (self) {
      if (data.role !== undefined || data.organization_id !== undefined) {
        throw forbidden('Cannot change role or organization');
      }
    } else {
      throw forbidden();
    }

    const updates = [];
    const params = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(String(data.name).trim());
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      params.push(String(data.email).trim().toLowerCase());
    }
    if (data.password) {
      const passwordHash = await bcrypt.hash(data.password, 10);
      updates.push('password_hash = ?');
      params.push(passwordHash);
    }

    const canChangeRole =
      actor.role === ROLES.SYSTEM_ADMIN ||
      (actor.role === ROLES.LAB_ADMIN && !self);

    if (data.role !== undefined && canChangeRole) {
      if (!canAssignRole(actor, data.role)) {
        throw forbidden(`Cannot assign role: ${data.role}`);
      }
      updates.push('role = ?');
      params.push(data.role);
    }

    if (data.organization_id !== undefined && actor.role === ROLES.SYSTEM_ADMIN) {
      updates.push('organization_id = ?');
      params.push(data.organization_id);
    }

    if (!updates.length) {
      return UsersService.getById(id, actor);
    }

    params.push(id);

    try {
      await db.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      return UsersService.getById(id, actor);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const e = new Error('Email already exists');
        e.status = 409;
        throw e;
      }
      throw err;
    }
  },

  delete: async (id, actor) => {
    if (
      actor.role !== ROLES.SYSTEM_ADMIN &&
      actor.role !== ROLES.LAB_ADMIN
    ) {
      throw forbidden('Only system_admin or lab_admin can delete users');
    }

    if (isSelf(actor, id)) {
      throw forbidden('Cannot delete your own account');
    }

    const [rows] = await db.query(
      'SELECT id, organization_id, role FROM users WHERE id = ?',
      [id]
    );
    const target = rows[0];
    if (!target) throw notFound();

    if (actor.role === ROLES.LAB_ADMIN) {
      if (Number(actor.organization_id) !== Number(target.organization_id)) {
        throw forbidden();
      }
      if (target.role === ROLES.SYSTEM_ADMIN) {
        throw forbidden('Cannot delete system_admin user');
      }
    }

    try {
      await db.query('DELETE FROM users WHERE id = ?', [id]);
    } catch (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        const e = new Error('Cannot delete user: related bookings exist');
        e.status = 409;
        throw e;
      }
      throw err;
    }

    return { message: `User with id ${id} deleted` };
  },
};

module.exports = UsersService;
