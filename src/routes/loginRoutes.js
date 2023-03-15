const express = require('express');

const router = express.Router();

const crypto = require('crypto');

const { validationLoginMiddleware } = require('../middlewares');

router.post('/', validationLoginMiddleware, async (req, res) => {
    const token = crypto.randomBytes(8).toString('hex');
    res.status(200).json({ token });
  });

module.exports = router;