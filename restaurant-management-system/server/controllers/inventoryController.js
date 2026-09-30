const MenuItem = require('../models/MenuItem');
const InventoryLog = require('../models/InventoryLog');

// @desc    Get inventory stock status and alerts
// @route   GET /api/inventory
// @access  Admin only
const getInventoryOverview = async (req, res) => {
  try {
    const items = await MenuItem.find()
      .populate('category_id', 'name')
      .sort({ stock_qty: 1 });

    const lowStockItems = items.filter((item) => item.stock_qty <= item.low_stock_threshold);
    const outOfStockItems = items.filter((item) => item.stock_qty <= 0);

    res.json({
      success: true,
      totalItems: items.length,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      lowStockItems,
      items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Adjust inventory quantity
// @route   POST /api/inventory/adjust
// @access  Admin only
const adjustStock = async (req, res) => {
  try {
    const { menu_item_id, change_qty, reason } = req.body;

    if (!menu_item_id || change_qty === undefined || !reason) {
      return res.status(400).json({ success: false, message: 'Item ID, change quantity, and reason are required.' });
    }

    const item = await MenuItem.findById(menu_item_id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    const delta = Number(change_qty);
    const newStock = item.stock_qty + delta;

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: `Adjustment would result in negative stock (${newStock}). Current stock is ${item.stock_qty}.`,
      });
    }

    item.stock_qty = newStock;
    await item.save();

    const log = await InventoryLog.create({
      menu_item_id: item._id,
      change_qty: delta,
      stock_after: newStock,
      reason,
      user_id: req.user._id,
    });

    const populatedLog = await InventoryLog.findById(log._id)
      .populate('menu_item_id', 'name price')
      .populate('user_id', 'fullName username');

    res.json({
      success: true,
      message: `Stock for '${item.name}' adjusted by ${delta > 0 ? '+' : ''}${delta}. New total: ${newStock}.`,
      item,
      log: populatedLog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get inventory audit logs
// @route   GET /api/inventory/logs
// @access  Admin only
const getInventoryLogs = async (req, res) => {
  try {
    const { menu_item_id, reason, limit = 100 } = req.query;
    let query = {};

    if (menu_item_id) query.menu_item_id = menu_item_id;
    if (reason) query.reason = reason;

    const logs = await InventoryLog.find(query)
      .populate('menu_item_id', 'name price')
      .populate('user_id', 'fullName username')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInventoryOverview,
  adjustStock,
  getInventoryLogs,
};
