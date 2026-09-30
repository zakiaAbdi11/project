const express = require('express');
const router = express.Router();
const {
  getInventoryOverview,
  adjustStock,
  getInventoryLogs,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.use(protect, requireAdmin);

router.get('/', getInventoryOverview);
router.post('/adjust', adjustStock);
router.get('/logs', getInventoryLogs);

module.exports = router;
