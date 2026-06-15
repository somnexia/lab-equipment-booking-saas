// server/pbServer.js
require('dotenv').config();
const express = require('express');
const PocketBase = require('pocketbase/cjs');
const path = require('path');

const app = express();
const pb = new PocketBase(process.env.PB_URL);

const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  try {
    const classes = await pb.collection('classes').getFullList();
    res.render('pbDashboard', { title: 'Student Achievements', classes });
  } catch (err) {
    console.error(err);
    res.render('pbDashboard', { title: 'Student Achievements', classes: [], error: 'Failed to connect to PocketBase' });
  }
});

app.get('/pb-login', (req, res) => {
  res.render('pbLogin', { title: 'Login to PocketBase' });
});

app.listen(PORT, () => {
  console.log(`PocketBase Express server running on port ${PORT}`);
});
