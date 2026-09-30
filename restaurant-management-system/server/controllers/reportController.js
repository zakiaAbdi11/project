const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const User = require('../models/User');

// @desc    Get Admin Dashboard summary stats
// @route   GET /api/reports/dashboard
// @access  Admin only
const getDashboardMetrics = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today's completed orders
    const todayOrders = await Order.find({
      status: 'Completed',
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const todayOrdersCount = todayOrders.length;

    // All-time sales
    const allCompletedOrders = await Order.find({ status: 'Completed' });
    const allTimeSales = allCompletedOrders.reduce((sum, order) => sum + order.total, 0);
    const allTimeOrdersCount = allCompletedOrders.length;

    // Table occupancy
    const totalTables = await Table.countDocuments();
    const occupiedTables = await Table.countDocuments({ status: 'Occupied' });
    const availableTables = await Table.countDocuments({ status: 'Available' });
    const reservedTables = await Table.countDocuments({ status: 'Reserved' });

    // Low stock items
    const allMenuItems = await MenuItem.find();
    const lowStockCount = allMenuItems.filter((item) => item.stock_qty <= item.low_stock_threshold).length;

    // Recent 6 orders
    const recentOrders = await Order.find()
      .populate('user_id', 'fullName username')
      .populate('table_id', 'table_number')
      .sort({ createdAt: -1 })
      .limit(6);

    // Top selling items aggregation
    const topItemsAggregation = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menu_item_id',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      metrics: {
        todaySales: Number(todaySales.toFixed(2)),
        todayOrdersCount,
        allTimeSales: Number(allTimeSales.toFixed(2)),
        allTimeOrdersCount,
        tables: {
          total: totalTables,
          occupied: occupiedTables,
          available: availableTables,
          reserved: reservedTables,
        },
        lowStockCount,
      },
      recentOrders,
      topSellingItems: topItemsAggregation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Sales Analytics (Daily, Weekly, Monthly, Cashier, Category)
// @route   GET /api/reports/sales
// @access  Admin only
const getSalesReport = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    let matchQuery = { status: 'Completed' };

    const now = new Date();
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    } else {
      if (period === 'daily') {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        matchQuery.createdAt = { $gte: start };
      } else if (period === 'weekly') {
        const start = new Date(now);
        start.setDate(now.getDate() - 7);
        matchQuery.createdAt = { $gte: start };
      } else if (period === 'monthly') {
        const start = new Date(now);
        start.setDate(now.getDate() - 30);
        matchQuery.createdAt = { $gte: start };
      }
    }

    // Sales over time grouping
    const salesOverTime = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalSales: { $sum: '$total' },
          ordersCount: { $sum: 1 },
          averageOrder: { $avg: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Sales by Cashier
    const salesByCashier = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$user_id',
          totalSales: { $sum: '$total' },
          ordersCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'cashier',
        },
      },
      { $unwind: { path: '$cashier', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          cashierId: '$_id',
          cashierName: '$cashier.fullName',
          username: '$cashier.username',
          totalSales: { $round: ['$totalSales', 2] },
          ordersCount: 1,
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    // Sales by Order Type (Dine-In vs Takeaway)
    const salesByType = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$order_type',
          totalSales: { $sum: '$total' },
          ordersCount: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    // Product Popularity
    const productPopularity = await Order.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menu_item_id',
          name: { $first: '$items.name' },
          unitPrice: { $first: '$items.price' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalQuantity: -1 } },
    ]);

    // Overall summary calculation
    const totalRevenue = salesOverTime.reduce((acc, curr) => acc + curr.totalSales, 0);
    const totalOrders = salesOverTime.reduce((acc, curr) => acc + curr.ordersCount, 0);

    res.json({
      success: true,
      period,
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        avgOrderValue: totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0,
      },
      salesOverTime,
      salesByCashier,
      salesByType,
      productPopularity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardMetrics,
  getSalesReport,
};
