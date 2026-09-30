const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'offline_restaurant_pos_secret_key_2026_super_secure');

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication failed. User no longer exists.' });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact an Administrator.' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'No authorization token provided.' });
  }
};

module.exports = { protect };
