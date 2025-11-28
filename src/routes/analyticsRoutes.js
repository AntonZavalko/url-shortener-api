const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/top', analyticsController.top);

module.exports = router;
