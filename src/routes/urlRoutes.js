const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

router.post('/api/shorten', urlController.shorten);
router.post('/api/bulk/shorten', urlController.bulkShorten);
router.get('/api/urls/:shortCode/stats', urlController.getStats);
router.get('/api/users/:id/urls', urlController.getUserUrls);
router.put('/api/urls/:shortCode', urlController.updateUrl);
router.delete('/api/urls/:shortCode', urlController.deleteUrl);

router.get('/:shortCode', urlController.redirect);

module.exports = router;
