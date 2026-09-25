'use strict';

// До подключения app: иначе возьмётся DB_NAME из .env (рабочая база).
process.env.DB_NAME='lab_equipment_booking_test';

const request = require('supertest');
const app = require('../app');
const roles = require('../../config/roles')