const express = require('express');
const router = express.Router();
const pbService = require('../../services/pbAuthService');

router.post('/', async (req, res) => {
  try {
    const { student, subject, grade, status } = req.body;

    const record = await pbService.createClass({
      student,
      subject,
      grade,
      status
    });

    res.json(record);

  } catch (err) {
    console.error('Create class error:', err);
    res.status(500).json({ error: 'Create failed' });
  }
});

module.exports = router;
