const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// All user management routes strictly require Admin role
router.use(protect, requireAdmin);

router.route('/').get(getUsers).post(createUser);
router.route('/:id').put(updateUser).delete(deleteUser);
router.put('/:id/reset-password', resetPassword);

module.exports = router;
