const express = require('express');
const router = express.Router();
const chaosController = require('../controllers/chaosController');

router.post('/enable', chaosController.enable);
router.post('/disable', chaosController.disable);

module.exports = router;
