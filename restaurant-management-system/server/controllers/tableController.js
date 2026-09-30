const Table = require('../models/Table');

// @desc    Get all tables
// @route   GET /api/tables
// @access  Public / Authenticated
const getTables = async (req, res) => {
  try {
    const tables = await Table.find()
      .populate({
        path: 'current_order_id',
        select: 'order_number total user_id items createdAt status',
        populate: { path: 'user_id', select: 'fullName username' },
      })
      .sort({ table_number: 1 });

    res.json({ success: true, count: tables.length, tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new table
// @route   POST /api/tables
// @access  Admin only
const createTable = async (req, res) => {
  try {
    const { table_number, capacity, status } = req.body;

    if (!table_number) {
      return res.status(400).json({ success: false, message: 'Table number is required.' });
    }

    const existing = await Table.findOne({ table_number: table_number.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Table '${table_number}' already exists.` });
    }

    const table = await Table.create({
      table_number: table_number.trim(),
      capacity: Number(capacity) || 4,
      status: status || 'Available',
    });

    res.status(201).json({
      success: true,
      message: `Table ${table.table_number} added.`,
      table,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Admin only
const updateTable = async (req, res) => {
  try {
    const { table_number, capacity, status } = req.body;
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found.' });
    }

    if (table_number) table.table_number = table_number.trim();
    if (capacity !== undefined) table.capacity = Number(capacity);
    if (status) {
      table.status = status;
      if (status === 'Available') {
        table.current_order_id = null;
      }
    }

    await table.save();

    res.json({
      success: true,
      message: `Table ${table.table_number} updated.`,
      table,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change table status (e.g. Free table, Reserve table)
// @route   PATCH /api/tables/:id/status
// @access  Cashier or Admin
const updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Available', 'Occupied', 'Reserved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid table status.' });
    }

    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found.' });
    }

    table.status = status;
    if (status === 'Available') {
      table.current_order_id = null;
    }

    await table.save();

    res.json({
      success: true,
      message: `Table ${table.table_number} status set to ${status}.`,
      table,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Admin only
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found.' });
    }

    if (table.status === 'Occupied') {
      return res.status(400).json({ success: false, message: 'Cannot delete an occupied table with an active order.' });
    }

    await Table.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: `Table ${table.table_number} removed successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTables,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
};
