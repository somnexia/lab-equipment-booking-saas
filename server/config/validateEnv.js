// config/validateEnv.js
require('dotenv').config();

const requiredVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'PORT'
];

const missingVars = requiredVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1); // прекращаем запуск сервера
}

console.log('✅ All required environment variables are set.');