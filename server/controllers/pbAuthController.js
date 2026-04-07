// // server/controllers/pocketbaseController.js
// const PocketBase = require('pocketbase/cjs');
// const pb = new PocketBase(process.env.PB_URL);

// const getClasses = async (req, res) => {
//   try {
//     // 🔐 логинимся в PocketBase (пример через admin)
//     await pb.admins.authWithPassword(
//       process.env.PB_ADMIN_EMAIL,
//       process.env.PB_ADMIN_PASSWORD
//     );

//     const records = await pb.collection('classes').getFullList();

//     res.render('dashboard', {
//       title: 'Dashboard',
//       classes: records
//     });

//   } catch (err) {
//     console.error(err);
//     res.render('dashboard', {
//       title: 'Dashboard',
//       classes: [],
//       error: 'Ошибка подключения к PocketBase'
//     });
//   }
// };

// module.exports = { getClasses };
