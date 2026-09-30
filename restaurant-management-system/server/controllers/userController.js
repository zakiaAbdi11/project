const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin only
const getUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new user (admin or cashier)
// @route   POST /api/users
// @access  Admin only
const createUser = async (req, res) => {
  try {
    const { username, fullName, password, role, status } = req.body;

    if (!username || !fullName || !password) {
      return res.status(400).json({ success: false, message: 'Username, Full Name, and Password are required.' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already in use.' });
    }

    const user = await User.create({
      username: username.toLowerCase().trim(),
      fullName,
      password,
      role: role || 'cashier',
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: `${user.role.toUpperCase()} user '${user.username}' created successfully.`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Admin only
const updateUser = async (req, res) => {
  try {
    const { fullName, role, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent demoting the last active admin
    if (user.role === 'admin' && role === 'cashier') {
      const adminCount = await User.countDocuments({ role: 'admin', status: 'active' });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot demote the only remaining active Administrator.' });
      }
    }

    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully.',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Admin only
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: `Password for user '${user.username}' has been reset successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin only
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own administrative account.' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `User '${user.username}' removed successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
};
