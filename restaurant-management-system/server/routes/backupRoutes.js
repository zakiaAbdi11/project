const express = require('express');
const router = express.Router();
const {
  createBackup,
  listBackups,
  restoreBackup,
} = require('../controllers/backupController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.use(protect, requireAdmin);

router.post('/create', createBackup);
router.get('/list', listBackups);
router.post('/restore', restoreBackup);

module.exports = router;
