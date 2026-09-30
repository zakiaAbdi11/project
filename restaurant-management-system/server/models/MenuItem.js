const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    stock_qty: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    low_stock_threshold: {
      type: Number,
      default: 5,
    },
    image_url: {
      type: String,
      default: '',
    },
    is_available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property to check low stock
menuItemSchema.virtual('is_low_stock').get(function () {
  return this.stock_qty <= this.low_stock_threshold;
});

menuItemSchema.set('toJSON', { virtuals: true });
menuItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
