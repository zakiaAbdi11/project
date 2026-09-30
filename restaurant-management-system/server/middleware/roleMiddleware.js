const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access Denied: Administrator role privileges are required for this action.',
    });
  }
};

const requireCashierOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'cashier')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access Denied: Valid staff account required.',
    });
  }
};

module.exports = {
  requireAdmin,
  requireCashierOrAdmin,
};
