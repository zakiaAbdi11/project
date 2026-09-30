const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getSalesReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.use(protect, requireAdmin);

router.get('/dashboard', getDashboardMetrics);
router.get('/sales', getSalesReport);

module.exports = router;
