/**
 * Экспорт данных БД в JSON и XML.
 * Запуск: cd server && npm run export:db
 */
const pool = require('../config/db.js');
const fs = require('fs');
const path = require('path');

const TABLES = [
  'organizations',
  'users',
  'equipment_categories',
  'equipment',
  'bookings',
];

const OUTPUT_DIR = path.join(__dirname, '../../database/export/output');

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function maskUsers(rows) {
  return rows.map((row) => ({
    ...row,
    password_hash: '[REDACTED]',
  }));
}

async function fetchAllTables() {
  const data = {};
  for (const table of TABLES) {
    const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
    data[table] = table === 'users' ? maskUsers(rows) : rows;
  }
  return data;
}

function buildJsonPayload(dbName, tables) {
  return {
    exported_at: new Date().toISOString(),
    database: dbName,
    format: 'json',
    tables,
  };
}

function escapeXml(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildXml(dbName, tables) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<databaseExport name="${escapeXml(dbName)}" format="xml" exportedAt="${escapeXml(new Date().toISOString())}">`,
  ];

  for (const [table, rows] of Object.entries(tables)) {
    lines.push(`  <table name="${escapeXml(table)}">`);
    for (const row of rows) {
      lines.push('  <row>');
      for (const [key, value] of Object.entries(row)) {
        const safe =
          table === 'users' && key === 'password_hash' ? '[REDACTED]' : value;
        lines.push(`    <${key}>${escapeXml(safe)}</${key}>`);
      }
      lines.push('  </row>');
    }
    lines.push('  </table>');
  }

  lines.push('</databaseExport>');
  return lines.join('\n');
}

async function main() {
  const dbName = process.env.DB_NAME || 'lab_equipment_booking';
  ensureOutputDir();

  const tables = await fetchAllTables();
  const ts = timestamp();

  const jsonPath = path.join(OUTPUT_DIR, `${dbName}_${ts}.json`);
  const xmlPath = path.join(OUTPUT_DIR, `${dbName}_${ts}.xml`);

  fs.writeFileSync(jsonPath, JSON.stringify(buildJsonPayload(dbName, tables), null, 2));
  fs.writeFileSync(xmlPath, buildXml(dbName, tables));

  console.log(`JSON: ${jsonPath}`);
  console.log(`XML:  ${xmlPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Export failed:', err.message);
    process.exit(1);
  });