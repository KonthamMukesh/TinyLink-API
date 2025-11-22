const express = require('express');
const router = express.Router();
const controller = require('../Controllers/link.controller');

// ✅ Create link
router.post('/links', controller.createLink);

// ✅ Get all links
router.get('/links', controller.getAll);

// ✅ Get single link stats by code  (required for /code/:code)
router.get('/links/:code', controller.getLinkByCode);

// ✅ Update link (for editing short or long URL)
router.put('/links/:code', controller.updateLink);

// ✅ Delete by ID (recommended)
router.delete('/links/:id', controller.deleteLink);

// ✅ Global stats
router.get('/stats', controller.stats);

// ✅ Health check
router.get('/healthz', controller.health);

// ✅ Redirect & track clicks (must be last)
router.get('/r/:code', controller.redirect);


module.exports = router;
