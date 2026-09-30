const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);
router.post('/', requireAdmin, upload.single('image'), createMenuItem);
router.put('/:id', requireAdmin, upload.single('image'), updateMenuItem);
router.patch('/:id/toggle-availability', toggleAvailability);
router.delete('/:id', requireAdmin, deleteMenuItem);

module.exports = router;
