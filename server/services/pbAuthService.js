const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase(process.env.PB_URL);

async function authAdmin() {
  try {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL,
      process.env.PB_ADMIN_PASSWORD
    );
    console.log("PB AUTH OK ✅");
  } catch (err) {
    console.error("❌ PB AUTH ERROR:", err.message);
    console.error("PB FULL ERROR:", err.response || err);
    throw err;
  }
}
async function getClasses() {
  await authAdmin();
  const records = await pb.collection('classes').getFullList();
  // Преобразуем в формат для dashboard
  return records.map(r => ({
    student: r.student || r.student_name || '—',
    subject: r.subject || '—',
    grade: r.grade || '—',
    status: r.status || '—'
  }));
}

const pbAuthService = {

  async register({ name, email, password, role = 'user' }) {
    // Сначала авторизуемся
    await authAdmin();

    console.log("PB register attempt:");
    console.log({ name, email, password: '***', role }); // не выводи пароль в логи полностью

    try {
      const record = await pb.collection('users').create({
        name,
        email,
        password,
        passwordConfirm: password, // обязательно для PB
        role
      });

      console.log("✅ PB user created:", record);
      return record;

    } catch (err) {
      console.error("❌ PB CREATE ERROR:", err.message);

      // Полный объект ошибки для анализа
      console.error("PB FULL ERROR:", err.response || err);

      throw err; // чтобы контроллер мог обработать
    }
  },
  getClasses

};

module.exports = pbAuthService;