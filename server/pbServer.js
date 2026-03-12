// server/pbServer.js
require('dotenv').config();
const express = require('express');
const PocketBase = require('pocketbase/cjs');
const path = require('path');

const app = express();
const pb = new PocketBase(process.env.PB_URL);

const PORT = process.env.PORT || 3000;

// Настройка шаблонов
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// --- Маршруты ---
app.get('/', async (req, res) => {
  try {
    const classes = await pb.collection('classes').getFullList(); // public collection
    res.render('pbDashboard', { title: 'Student Achievements', classes });
  } catch (err) {
    console.error(err);
    res.render('pbDashboard', { title: 'Student Achievements', classes: [], error: 'Ошибка подключения к базе данных PocketBase' });
  }
});

// Страница логина (если нужна проверка админа)
app.get('/pb-login', (req, res) => {
  res.render('pbLogin', { title: 'Login to PocketBase' });
});

// Прослушиваем порт
app.listen(PORT, () => {
  console.log(`PocketBase Express server running on port ${PORT}`);
});