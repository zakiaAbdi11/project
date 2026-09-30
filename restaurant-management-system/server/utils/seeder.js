const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const InventoryLog = require('../models/InventoryLog');
const SystemSettings = require('../models/SystemSettings');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant_management');
    console.log('[Seeder] Connected to MongoDB...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      MenuItem.deleteMany({}),
      Table.deleteMany({}),
      Order.deleteMany({}),
      Payment.deleteMany({}),
      InventoryLog.deleteMany({}),
      SystemSettings.deleteMany({}),
    ]);
    console.log('[Seeder] Cleared previous records.');

    // 1. System Settings
    const settings = await SystemSettings.create({
      restaurant_name: 'The Rustic Flame Bistro',
      address: '124 Downtown Boulevard, Suite 101, Metro City',
      phone: '+1 (555) 234-5678',
      currency_symbol: '$',
      tax_percentage: 8.5,
      receipt_header: 'Fast, Fresh & Flame-Grilled - Thank You for Dining Local!',
      receipt_footer: '*** Retain this receipt for returns/inquiries within 24h ***',
    });
    console.log('[Seeder] Seeded System Settings.');

    // 2. Users (Admin + Cashier)
    const adminUser = await User.create({
      username: 'admin',
      fullName: 'Alex Stone (General Manager)',
      password: 'admin123',
      role: 'admin',
      status: 'active',
    });

    const cashierUser = await User.create({
      username: 'cashier',
      fullName: 'Sarah Jenkins (Head Cashier)',
      password: 'cashier123',
      role: 'cashier',
      status: 'active',
    });
    console.log('[Seeder] Seeded Users: admin / admin123, cashier / cashier123');

    // 3. Categories
    const categories = await Category.insertMany([
      { name: 'Artisan Burgers', description: 'Gourmet flame-grilled beef, chicken and vegan patties', icon: 'Sandwich' },
      { name: 'Wood-Fired Pizzas', description: 'Hand-tossed sourdough with rustic toppings', icon: 'Pizza' },
      { name: 'Appetizers & Sides', description: 'Crispy finger foods, loaded fries and wings', icon: 'Utensils' },
      { name: 'Main Entrees', description: 'Steaks, ribs, roasted chicken and chef specialties', icon: 'Flame' },
      { name: 'Craft Beverages', description: 'Artisan sodas, fresh pressed juices, and iced teas', icon: 'Coffee' },
      { name: 'Decadent Desserts', description: 'Baked daily sweet finishes and gelato', icon: 'IceCream' },
    ]);
    console.log(`[Seeder] Seeded ${categories.length} Categories.`);

    // 4. Menu Items
    const catMap = {};
    categories.forEach((cat) => {
      catMap[cat.name] = cat._id;
    });

    const sampleMenuItems = [
      // Burgers
      {
        name: 'The Flame Truffle Burger',
        category_id: catMap['Artisan Burgers'],
        price: 15.50,
        stock_qty: 45,
        low_stock_threshold: 8,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
      },
      {
        name: 'Smoked Bacon Cheddar Burger',
        category_id: catMap['Artisan Burgers'],
        price: 14.00,
        stock_qty: 38,
        low_stock_threshold: 10,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80',
      },
      {
        name: 'Spicy Crispy Chicken Burger',
        category_id: catMap['Artisan Burgers'],
        price: 13.50,
        stock_qty: 24,
        low_stock_threshold: 5,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&q=80',
      },
      // Pizzas
      {
        name: 'Rustic Pepperoni & Hot Honey Pizza',
        category_id: catMap['Wood-Fired Pizzas'],
        price: 18.00,
        stock_qty: 30,
        low_stock_threshold: 6,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80',
      },
      {
        name: 'Classic Margherita Basil Pizza',
        category_id: catMap['Wood-Fired Pizzas'],
        price: 16.00,
        stock_qty: 4, // Low stock on purpose to test alert badge!
        low_stock_threshold: 5,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&q=80',
      },
      {
        name: 'Wild Mushroom & Truffle Cream Pizza',
        category_id: catMap['Wood-Fired Pizzas'],
        price: 19.50,
        stock_qty: 20,
        low_stock_threshold: 5,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
      },
      // Sides & Apps
      {
        name: 'Golden Truffle Parmesan Fries',
        category_id: catMap['Appetizers & Sides'],
        price: 7.50,
        stock_qty: 60,
        low_stock_threshold: 15,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&q=80',
      },
      {
        name: 'Smoked BBQ Chicken Wings (8 pcs)',
        category_id: catMap['Appetizers & Sides'],
        price: 11.50,
        stock_qty: 25,
        low_stock_threshold: 5,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&q=80',
      },
      {
        name: 'Crispy Calamari with Garlic Aioli',
        category_id: catMap['Appetizers & Sides'],
        price: 12.00,
        stock_qty: 18,
        low_stock_threshold: 5,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=500&q=80',
      },
      // Mains
      {
        name: 'Prime Ribeye Steak (300g)',
        category_id: catMap['Main Entrees'],
        price: 29.50,
        stock_qty: 15,
        low_stock_threshold: 4,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80',
      },
      {
        name: 'Slow Smoked BBQ Baby Back Ribs',
        category_id: catMap['Main Entrees'],
        price: 24.00,
        stock_qty: 2, // Low stock!
        low_stock_threshold: 5,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80',
      },
      // Drinks
      {
        name: 'Fresh Mint Lemonade',
        category_id: catMap['Craft Beverages'],
        price: 4.50,
        stock_qty: 70,
        low_stock_threshold: 10,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80',
      },
      {
        name: 'Iced Cold Brew Coffee',
        category_id: catMap['Craft Beverages'],
        price: 5.00,
        stock_qty: 55,
        low_stock_threshold: 10,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&q=80',
      },
      // Desserts
      {
        name: 'Molten Lava Chocolate Cake',
        category_id: catMap['Decadent Desserts'],
        price: 8.50,
        stock_qty: 22,
        low_stock_threshold: 5,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
      },
      {
        name: 'New York Salted Caramel Cheesecake',
        category_id: catMap['Decadent Desserts'],
        price: 8.00,
        stock_qty: 19,
        low_stock_threshold: 5,
        is_available: true,
        image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80',
      },
    ];

    const createdItems = await MenuItem.insertMany(sampleMenuItems);
    console.log(`[Seeder] Seeded ${createdItems.length} Menu Items.`);

    // 5. Initial Inventory Logs for items
    for (const item of createdItems) {
      await InventoryLog.create({
        menu_item_id: item._id,
        change_qty: item.stock_qty,
        stock_after: item.stock_qty,
        reason: 'Initial Stock',
        user_id: adminUser._id,
      });
    }

    // 6. Tables
    const tables = await Table.insertMany([
      { table_number: 'T-01', capacity: 2, status: 'Available' },
      { table_number: 'T-02', capacity: 2, status: 'Available' },
      { table_number: 'T-03', capacity: 4, status: 'Available' },
      { table_number: 'T-04', capacity: 4, status: 'Available' },
      { table_number: 'T-05', capacity: 4, status: 'Reserved' },
      { table_number: 'T-06', capacity: 6, status: 'Available' },
      { table_number: 'T-07', capacity: 6, status: 'Available' },
      { table_number: 'T-08', capacity: 8, status: 'Available' },
    ]);
    console.log(`[Seeder] Seeded ${tables.length} Dining Tables.`);

    // 7. Seed Sample Initial Completed Order to warm up metrics
    const item1 = createdItems[0];
    const item2 = createdItems[3];
    const item3 = createdItems[6];

    const subtotal = item1.price + item2.price + item3.price;
    const tax = Number(((subtotal * 8.5) / 100).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    const sampleOrder = await Order.create({
      order_number: 'ORD-20260930-0001',
      user_id: cashierUser._id,
      table_id: tables[2]._id,
      order_type: 'Dine-In',
      items: [
        { menu_item_id: item1._id, name: item1.name, price: item1.price, quantity: 1, subtotal: item1.price },
        { menu_item_id: item2._id, name: item2.name, price: item2.price, quantity: 1, subtotal: item2.price },
        { menu_item_id: item3._id, name: item3.name, price: item3.price, quantity: 1, subtotal: item3.price },
      ],
      subtotal,
      tax_percentage: 8.5,
      tax_amount: tax,
      discount: 0,
      total,
      amount_paid: 50.00,
      change_given: Number((50.00 - total).toFixed(2)),
      payment_method: 'Cash',
      status: 'Completed',
    });

    await Payment.create({
      order_id: sampleOrder._id,
      cashier_id: cashierUser._id,
      amount: total,
      payment_method: 'Cash',
      date: new Date(),
    });

    console.log('[Seeder] Seeded initial sample order.');
    console.log('-------------------------------------------------------');
    console.log('Database Seeding Completed Successfully!');
    console.log('Admin Account:   username: admin    | password: admin123');
    console.log('Cashier Account: username: cashier  | password: cashier123');
    console.log('-------------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]', error);
    process.exit(1);
  }
};

seedDatabase();
