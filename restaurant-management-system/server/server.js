const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Local MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allows local frontend client on any local port (e.g. 5173)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static directory for uploaded images (Offline files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Offline Restaurant Management & POS System',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/tables', require('./routes/tableRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/backup', require('./routes/backupRoutes'));

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found on local POS server.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal POS Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`[Restaurant POS Server] Running offline on port ${PORT}`);
  console.log(`[API URL] http://localhost:${PORT}/api`);
  console.log(`[Database] mongodb://127.0.0.1:27017/restaurant_management`);
  console.log(`=======================================================`);
});
