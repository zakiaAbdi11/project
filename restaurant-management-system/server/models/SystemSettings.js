const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    restaurant_name: {
      type: String,
      default: 'The Rustic Flame Bistro',
      required: true,
    },
    address: {
      type: String,
      default: '124 Downtown Boulevard, Suite 101',
    },
    phone: {
      type: String,
      default: '+1 (555) 234-5678',
    },
    currency_symbol: {
      type: String,
      default: '$',
    },
    tax_percentage: {
      type: Number,
      default: 8.5,
      min: 0,
      max: 100,
    },
    receipt_header: {
      type: String,
      default: 'Welcome to our Bistro! Fast, Fresh, Delicious.',
    },
    receipt_footer: {
      type: String,
      default: 'Thank you for dining with us! Please come again.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
