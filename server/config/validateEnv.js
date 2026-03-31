// config/validateEnv.js
require('dotenv').config();

const requiredVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'PORT',
  'PB_URL' // 👈 добавили PocketBase
];

// Проверяем отсутствие переменных
const missingVars = requiredVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Дополнительные проверки (очень полезно 👇)

// PORT должен быть числом
if (isNaN(process.env.PORT)) {
  console.error('❌ PORT must be a number');
  process.exit(1);
}

// JWT_SECRET должен быть не слишком коротким
if (process.env.JWT_SECRET.length < 10) {
  console.error('❌ JWT_SECRET is too short (min 10 chars)');
  process.exit(1);
}

// PB_URL должен начинаться с http
if (!process.env.PB_URL.startsWith('http')) {
  console.error('❌ PB_URL must start with http/https');
  process.exit(1);
}

console.log('✅ All required environment variables are valid.');