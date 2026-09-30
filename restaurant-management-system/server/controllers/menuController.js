const MenuItem = require('../models/MenuItem');
const InventoryLog = require('../models/InventoryLog');
const fs = require('fs');
const path = require('path');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public / Authenticated
const getMenuItems = async (req, res) => {
  try {
    const { category, search, availableOnly } = req.query;
    let query = {};

    if (category) {
      query.category_id = category;
    }

    if (availableOnly === 'true') {
      query.is_available = true;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const items = await MenuItem.find(query)
      .populate('category_id', 'name icon')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public / Authenticated
const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category_id', 'name icon');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Admin only
const createMenuItem = async (req, res) => {
  try {
    const { name, category_id, price, stock_qty, low_stock_threshold, is_available } = req.body;

    if (!name || !category_id || price === undefined) {
      return res.status(400).json({ success: false, message: 'Name, Category, and Price are required.' });
    }

    let image_url = '';
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url) {
      image_url = req.body.image_url;
    }

    const initialStock = Number(stock_qty) || 0;

    const item = await MenuItem.create({
      name: name.trim(),
      category_id,
      price: Number(price),
      stock_qty: initialStock,
      low_stock_threshold: Number(low_stock_threshold) || 5,
      image_url,
      is_available: is_available !== undefined ? (is_available === 'true' || is_available === true) : true,
    });

    // Create Initial Stock Inventory Log
    if (initialStock > 0) {
      await InventoryLog.create({
        menu_item_id: item._id,
        change_qty: initialStock,
        stock_after: initialStock,
        reason: 'Initial Stock',
        user_id: req.user._id,
      });
    }

    const populatedItem = await MenuItem.findById(item._id).populate('category_id', 'name icon');

    res.status(201).json({
      success: true,
      message: `Menu item '${item.name}' created successfully.`,
      item: populatedItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Admin only
const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    const { name, category_id, price, stock_qty, low_stock_threshold, is_available } = req.body;

    if (name) item.name = name.trim();
    if (category_id) item.category_id = category_id;
    if (price !== undefined) item.price = Number(price);
    if (low_stock_threshold !== undefined) item.low_stock_threshold = Number(low_stock_threshold);
    if (is_available !== undefined) {
      item.is_available = is_available === 'true' || is_available === true;
    }

    if (stock_qty !== undefined && Number(stock_qty) !== item.stock_qty) {
      const diff = Number(stock_qty) - item.stock_qty;
      item.stock_qty = Number(stock_qty);
      await InventoryLog.create({
        menu_item_id: item._id,
        change_qty: diff,
        stock_after: item.stock_qty,
        reason: 'Manual Adjustment',
        user_id: req.user._id,
      });
    }

    if (req.file) {
      // If previous uploaded file exists, delete it
      if (item.image_url && item.image_url.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', item.image_url);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (_) {}
        }
      }
      item.image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url !== undefined && req.body.image_url !== item.image_url) {
      item.image_url = req.body.image_url;
    }

    await item.save();
    const updated = await MenuItem.findById(item._id).populate('category_id', 'name icon');

    res.json({
      success: true,
      message: `Menu item '${item.name}' updated successfully.`,
      item: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle availability
// @route   PATCH /api/menu/:id/toggle-availability
// @access  Cashier or Admin
const toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    item.is_available = !item.is_available;
    await item.save();

    res.json({
      success: true,
      message: `'${item.name}' is now ${item.is_available ? 'Available' : 'Unavailable'}.`,
      item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Admin only
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    if (item.image_url && item.image_url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', item.image_url);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) {}
      }
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: `Menu item '${item.name}' deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
};
