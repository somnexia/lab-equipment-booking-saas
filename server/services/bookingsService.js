const db = require('../config/db');
const { ROLES } = require('../config/roles');

const VALID_STATUSES = ['active', 'completed', 'cancelled'];

function forbidden(message = 'Access denied') {
  const err = new Error(message);
  err.status = 403;
  return err;
}

function notFound(message = 'Booking not found') {
  const err = new Error(message);
  err.status = 404;
  return err;
}

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  throw err;
}

function firstResultSet(rows) {
  if (Array.isArray(rows) && Array.isArray(rows[0])) {
    return rows[0][0];
  }
  return rows[0];
}

function assertOrgInToken(actor) {
  if (!actor.organization_id) {
    throw forbidden('organization_id missing in token');
  }
}

function assertCanRead(booking, actor) {
  if (actor.role === ROLES.SYSTEM_ADMIN) return;

  if (actor.role === ROLES.STUDENT) {
    if (Number(booking.user_id) === Number(actor.id)) return;
    throw forbidden();
  }

  assertOrgInToken(actor);
  if (Number(booking.organization_id) === Number(actor.organization_id)) return;

  throw forbidden();
}

function parseListFilters(query = {}) {
  const filters = {};

  if (query.status) {
    if (!VALID_STATUSES.includes(query.status)) {
      badRequest('invalid status filter');
    }
    filters.status = query.status;
  }

  if (query.equipment_id !== undefined && query.equipment_id !== '') {
    const equipmentId = Number(query.equipment_id);
    if (Number.isNaN(equipmentId)) badRequest('invalid equipment_id');
    filters.equipment_id = equipmentId;
  }

  if (query.user_id !== undefined && query.user_id !== '') {
    const userId = Number(query.user_id);
    if (Number.isNaN(userId)) badRequest('invalid user_id');
    filters.user_id = userId;
  }

  if (query.from) filters.from = query.from;
  if (query.to) filters.to = query.to;

  if (query.upcoming === 'true' || query.upcoming === '1') {
    filters.upcoming = true;
  }

  if (query.mine === 'true' || query.mine === '1') {
    filters.mine = true;
  }

  return filters;
}

function listScope(actor, filters) {
  if (filters.mine) {
    return { mode: 'own', userId: actor.id };
  }

  if (actor.role === ROLES.SYSTEM_ADMIN) {
    return { mode: 'all' };
  }

  if (actor.role === ROLES.STUDENT) {
    return { mode: 'own', userId: actor.id };
  }

  assertOrgInToken(actor);
  return { mode: 'org', organizationId: actor.organization_id };
}

async function fetchById(id) {
  const [rows] = await db.query(
    'SELECT * FROM v_bookings_detail WHERE booking_id = ?',
    [id]
  );
  return rows[0];
}

async function queryBookings(actor, filters = {}) {
  const scope = listScope(actor, filters);
  const conditions = [];
  const params = [];

  if (scope.mode === 'own') {
    conditions.push('user_id = ?');
    params.push(scope.userId);
  } else if (scope.mode === 'org') {
    conditions.push('organization_id = ?');
    params.push(scope.organizationId);
  }

  if (filters.status) {
    conditions.push('booking_status = ?');
    params.push(filters.status);
  }

  if (filters.equipment_id) {
    conditions.push('equipment_id = ?');
    params.push(filters.equipment_id);
  }

  if (filters.user_id) {
    if (
      actor.role !== ROLES.SYSTEM_ADMIN &&
      actor.role !== ROLES.LAB_ADMIN
    ) {
      throw forbidden('Only admins can filter by user_id');
    }
    conditions.push('user_id = ?');
    params.push(filters.user_id);
  }

  if (filters.from) {
    conditions.push('start_time >= ?');
    params.push(filters.from);
  }

  if (filters.to) {
    conditions.push('end_time <= ?');
    params.push(filters.to);
  }

  if (filters.upcoming) {
    conditions.push("booking_status = 'active'");
    conditions.push('end_time >= NOW()');
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.query(
    `SELECT * FROM v_bookings_detail ${where} ORDER BY start_time DESC`,
    params
  );
  return rows;
}

const BookingsService = {
  getAll: async (actor, query = {}) => {
    const filters = parseListFilters(query);
    return queryBookings(actor, filters);
  },

  getMine: async (actor) => {
    return queryBookings(actor, { mine: true });
  },

  getUpcoming: async (actor, query = {}) => {
    const filters = parseListFilters({ ...query, upcoming: 'true' });
    return queryBookings(actor, filters);
  },

  getById: async (id, actor) => {
    const booking = await fetchById(id);
    if (!booking) throw notFound();
    assertCanRead(booking, actor);
    return booking;
  },

  create: async (booking, actor) => {
    const { equipment_id, user_id, start_time, end_time } = booking;

    if (!equipment_id || !start_time || !end_time) {
      badRequest('equipment_id, start_time and end_time are required');
    }

    const targetUserId = user_id || actor.id;

    const [rows] = await db.query(
      'CALL sp_create_booking(?, ?, ?, ?, ?, ?)',
      [equipment_id, targetUserId, start_time, end_time, actor.id, actor.role]
    );

    const result = firstResultSet(rows);
    return BookingsService.getById(result.booking_id, actor);
  },

  cancel: async (id, actor) => {
    const existing = await fetchById(id);
    if (!existing) throw notFound();
    assertCanRead(existing, actor);

    const [rows] = await db.query('CALL sp_cancel_booking(?, ?, ?)', [
      id,
      actor.id,
      actor.role,
    ]);
    firstResultSet(rows);
    return BookingsService.getById(id, actor);
  },

  complete: async (id, actor) => {
    const existing = await fetchById(id);
    if (!existing) throw notFound();
    assertCanRead(existing, actor);

    const [rows] = await db.query('CALL sp_complete_booking(?, ?, ?)', [
      id,
      actor.id,
      actor.role,
    ]);
    firstResultSet(rows);
    return BookingsService.getById(id, actor);
  },

  update: async (id, booking, actor) => {
    const { start_time, end_time, status } = booking;

    if (status === 'cancelled') {
      return BookingsService.cancel(id, actor);
    }

    if (status === 'completed') {
      return BookingsService.complete(id, actor);
    }

    if (start_time && end_time) {
      const existing = await fetchById(id);
      if (!existing) throw notFound();
      assertCanRead(existing, actor);

      const [rows] = await db.query('CALL sp_update_booking(?, ?, ?, ?, ?)', [
        id,
        start_time,
        end_time,
        actor.id,
        actor.role,
      ]);
      firstResultSet(rows);
      return BookingsService.getById(id, actor);
    }

    const existing = await BookingsService.getById(id, actor);
    return { ...existing, ...booking };
  },

  delete: async (id, actor) => {
    const booking = await BookingsService.cancel(id, actor);
    return {
      message: `Booking ${id} cancelled`,
      booking,
    };
  },
};

module.exports = BookingsService;
