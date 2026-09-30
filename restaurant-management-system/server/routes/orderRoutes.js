const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', requireAdmin, cancelOrder);

module.exports = router;
