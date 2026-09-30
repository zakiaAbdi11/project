const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Payment = require('../models/Payment');
const InventoryLog = require('../models/InventoryLog');
const SystemSettings = require('../models/SystemSettings');

// Helper to generate unique order number: ORD-YYYYMMDD-XXXX
const generateOrderNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const countToday = await Order.countDocuments({
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lte: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  });
  const sequence = String(countToday + 1).padStart(4, '0');
  return `ORD-${dateStr}-${sequence}`;
};

// @desc    Create new order & process payment
// @route   POST /api/orders
// @access  Cashier or Admin
const createOrder = async (req, res) => {
  try {
    const {
      table_id,
      order_type,
      items,
      discount = 0,
      amount_paid = 0,
      payment_method = 'Cash',
      notes = '',
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart cannot be empty. Please add items.' });
    }

    // Fetch active system settings for tax rate
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    const taxRate = settings.tax_percentage || 0;

    // Validate and process items
    let processedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menu_item_id);
      if (!menuItem) {
        return res.status(400).json({ success: false, message: `Item with id ${item.menu_item_id} not found.` });
      }

      if (!menuItem.is_available) {
        return res.status(400).json({ success: false, message: `'${menuItem.name}' is currently unavailable.` });
      }

      const qty = Number(item.quantity) || 1;
      if (menuItem.stock_qty < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${menuItem.name}'. Available: ${menuItem.stock_qty}, Requested: ${qty}.`,
        });
      }

      const lineTotal = menuItem.price * qty;
      calculatedSubtotal += lineTotal;

      processedItems.push({
        menu_item_id: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
        subtotal: lineTotal,
      });
    }

    const discountAmount = Math.max(0, Number(discount) || 0);
    const taxableSubtotal = Math.max(0, calculatedSubtotal - discountAmount);
    const taxAmount = Number(((taxableSubtotal * taxRate) / 100).toFixed(2));
    const finalTotal = Number((taxableSubtotal + taxAmount).toFixed(2));

    const paid = Number(amount_paid) || finalTotal;
    if (paid < finalTotal) {
      return res.status(400).json({
        success: false,
        message: `Amount paid ($${paid.toFixed(2)}) is less than total ($${finalTotal.toFixed(2)}).`,
      });
    }

    const changeGiven = Number((paid - finalTotal).toFixed(2));
    const orderNumber = await generateOrderNumber();

    // Deduct stock and write InventoryLogs
    for (const item of processedItems) {
      const updatedItem = await MenuItem.findByIdAndUpdate(
        item.menu_item_id,
        { $inc: { stock_qty: -item.quantity } },
        { new: true }
      );

      await InventoryLog.create({
        menu_item_id: item.menu_item_id,
        change_qty: -item.quantity,
        stock_after: updatedItem ? updatedItem.stock_qty : 0,
        reason: 'Order Sale',
        user_id: req.user._id,
      });
    }

    // Create Order
    const order = await Order.create({
      order_number: orderNumber,
      user_id: req.user._id,
      table_id: order_type === 'Dine-In' ? table_id : null,
      order_type: order_type || 'Takeaway',
      items: processedItems,
      subtotal: Number(calculatedSubtotal.toFixed(2)),
      tax_percentage: taxRate,
      tax_amount: taxAmount,
      discount: discountAmount,
      total: finalTotal,
      amount_paid: paid,
      change_given: changeGiven,
      payment_method: payment_method || 'Cash',
      status: 'Completed',
      notes,
    });

    // Create Payment Record
    const payment = await Payment.create({
      order_id: order._id,
      cashier_id: req.user._id,
      amount: finalTotal,
      payment_method: payment_method || 'Cash',
      date: new Date(),
    });

    // If Dine-In, update table status
    if (order_type === 'Dine-In' && table_id) {
      await Table.findByIdAndUpdate(table_id, {
        status: 'Occupied',
        current_order_id: order._id,
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('user_id', 'fullName username role')
      .populate('table_id', 'table_number capacity status');

    res.status(201).json({
      success: true,
      message: `Order ${order.order_number} created successfully.`,
      order: populatedOrder,
      payment,
      settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get orders (list with filters)
// @route   GET /api/orders
// @access  Cashier or Admin
const getOrders = async (req, res) => {
  try {
    const { status, order_type, cashier_id, date, startDate, endDate, limit = 50, page = 1 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (order_type) query.order_type = order_type;
    if (cashier_id) query.user_id = cashier_id;

    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate('user_id', 'fullName username role')
      .populate('table_id', 'table_number')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalOrders = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      totalOrders,
      currentPage: Number(page),
      totalPages: Math.ceil(totalOrders / Number(limit)),
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Cashier or Admin
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user_id', 'fullName username role')
      .populate('table_id', 'table_number capacity status');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const payment = await Payment.findOne({ order_id: order._id });
    const settings = await SystemSettings.findOne();

    res.json({
      success: true,
      order,
      payment,
      settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order (Restores inventory & table)
// @route   PATCH /api/orders/:id/cancel
// @access  Admin only
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled.' });
    }

    // Restore stock for all items
    for (const item of order.items) {
      const updatedItem = await MenuItem.findByIdAndUpdate(
        item.menu_item_id,
        { $inc: { stock_qty: item.quantity } },
        { new: true }
      );

      await InventoryLog.create({
        menu_item_id: item.menu_item_id,
        change_qty: item.quantity,
        stock_after: updatedItem ? updatedItem.stock_qty : 0,
        reason: 'Order Cancelled Refund',
        user_id: req.user._id,
      });
    }

    // Free table if dine-in
    if (order.table_id) {
      await Table.findByIdAndUpdate(order.table_id, {
        status: 'Available',
        current_order_id: null,
      });
    }

    order.status = 'Cancelled';
    await order.save();

    res.json({
      success: true,
      message: `Order ${order.order_number} cancelled and inventory refunded.`,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
};
