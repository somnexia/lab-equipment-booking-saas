// server/controllers/pocketbaseController.js
const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase(process.env.PB_URL);

const getClasses = async (req, res) => {
  try {
    const records = await pb.collection('classes').getFullList();
    res.render('dashboard', {   // используем dashboard.jade
      title: 'Dashboard',
      classes: records
    });
  } catch (err) {
    console.error(err);
    res.render('dashboard', {
      title: 'Dashboard',
      classes: [],
      error: 'Ошибка подключения к PocketBase'
    });
  }
};

module.exports = { getClasses };