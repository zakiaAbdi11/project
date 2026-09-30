const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const InventoryLog = require('../models/InventoryLog');
const SystemSettings = require('../models/SystemSettings');

const backupDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// @desc    Create local database backup
// @route   POST /api/backup/create
// @access  Admin only
const createBackup = async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    // Export all collections
    const [users, categories, menuItems, tables, orders, payments, inventoryLogs, settings] = await Promise.all([
      User.find().lean(),
      Category.find().lean(),
      MenuItem.find().lean(),
      Table.find().lean(),
      Order.find().lean(),
      Payment.find().lean(),
      InventoryLog.find().lean(),
      SystemSettings.find().lean(),
    ]);

    const backupPayload = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      database: 'restaurant_management',
      counts: {
        users: users.length,
        categories: categories.length,
        menuItems: menuItems.length,
        tables: tables.length,
        orders: orders.length,
        payments: payments.length,
        inventoryLogs: inventoryLogs.length,
        settings: settings.length,
      },
      data: {
        users,
        categories,
        menuItems,
        tables,
        orders,
        payments,
        inventoryLogs,
        settings,
      },
    };

    fs.writeFileSync(filepath, JSON.stringify(backupPayload, null, 2), 'utf-8');
    const stats = fs.statSync(filepath);

    res.status(201).json({
      success: true,
      message: `Database backup created successfully: ${filename}`,
      backup: {
        filename,
        sizeKb: Number((stats.size / 1024).toFixed(2)),
        createdAt: stats.birthtime,
        counts: backupPayload.counts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List all local database backups
// @route   GET /api/backup/list
// @access  Admin only
const listBackups = async (req, res) => {
  try {
    const files = fs.readdirSync(backupDir).filter((file) => file.endsWith('.json'));

    const backups = files.map((file) => {
      const fullPath = path.join(backupDir, file);
      const stats = fs.statSync(fullPath);
      let summary = null;
      try {
        const fileContent = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        summary = fileContent.counts || null;
      } catch (_) {}

      return {
        filename: file,
        sizeKb: Number((stats.size / 1024).toFixed(2)),
        createdAt: stats.mtime,
        summary,
      };
    });

    backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, count: backups.length, backups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore database from backup file
// @route   POST /api/backup/restore
// @access  Admin only
const restoreBackup = async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ success: false, message: 'Backup filename is required.' });
    }

    const filepath = path.join(backupDir, path.basename(filename));
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ success: false, message: 'Selected backup file not found.' });
    }

    const rawData = fs.readFileSync(filepath, 'utf-8');
    const backup = JSON.parse(rawData);

    if (!backup.data) {
      return res.status(400).json({ success: false, message: 'Invalid backup format.' });
    }

    // Perform database restoration
    if (backup.data.categories && backup.data.categories.length > 0) {
      await Category.deleteMany({});
      await Category.insertMany(backup.data.categories);
    }

    if (backup.data.menuItems && backup.data.menuItems.length > 0) {
      await MenuItem.deleteMany({});
      await MenuItem.insertMany(backup.data.menuItems);
    }

    if (backup.data.tables && backup.data.tables.length > 0) {
      await Table.deleteMany({});
      await Table.insertMany(backup.data.tables);
    }

    if (backup.data.orders && backup.data.orders.length > 0) {
      await Order.deleteMany({});
      await Order.insertMany(backup.data.orders);
    }

    if (backup.data.payments && backup.data.payments.length > 0) {
      await Payment.deleteMany({});
      await Payment.insertMany(backup.data.payments);
    }

    if (backup.data.inventoryLogs && backup.data.inventoryLogs.length > 0) {
      await InventoryLog.deleteMany({});
      await InventoryLog.insertMany(backup.data.inventoryLogs);
    }

    if (backup.data.settings && backup.data.settings.length > 0) {
      await SystemSettings.deleteMany({});
      await SystemSettings.insertMany(backup.data.settings);
    }

    // Preserve users or restore
    if (backup.data.users && backup.data.users.length > 0) {
      await User.deleteMany({});
      await User.insertMany(backup.data.users);
    }

    res.json({
      success: true,
      message: `Database successfully restored from backup: ${filename}`,
      counts: backup.counts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Restore failed: ${error.message}` });
  }
};

module.exports = {
  createBackup,
  listBackups,
  restoreBackup,
};
