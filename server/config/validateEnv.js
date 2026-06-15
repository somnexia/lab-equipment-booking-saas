// config/validateEnv.js
require('dotenv').config();

const simplePasswordMode = (process.env.SIMPLE_PASSWORD_MODE || 'on').toLowerCase();
const simplePasswordRequired = simplePasswordMode !== 'off';

const requiredVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'PORT',
  'PB_URL',
];

if (simplePasswordRequired) {
  requiredVars.push('SIMPLE_PASSWORD');
}

const missingVars = requiredVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

if (isNaN(process.env.PORT)) {
  console.error('❌ PORT must be a number');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 10) {
  console.error('❌ JWT_SECRET is too short (min 10 chars)');
  process.exit(1);
}

if (simplePasswordRequired) {
  if (process.env.SIMPLE_PASSWORD.length < 6) {
    console.error('❌ SIMPLE_PASSWORD is too short (min 6 chars)');
    process.exit(1);
  }
}

if (!process.env.PB_URL.startsWith('http')) {
  console.error('❌ PB_URL must start with http/https');
  process.exit(1);
}

console.log('✅ All required environment variables are valid.');
