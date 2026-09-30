const express = require('express');
const router = express.Router();
const {
  getTables,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
} = require('../controllers/tableController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getTables);
router.post('/', requireAdmin, createTable);
router.put('/:id', requireAdmin, updateTable);
router.patch('/:id/status', updateTableStatus);
router.delete('/:id', requireAdmin, deleteTable);

module.exports = router;
