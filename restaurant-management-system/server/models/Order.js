const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menu_item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    order_number: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    table_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      default: null,
    },
    order_type: {
      type: String,
      enum: ['Dine-In', 'Takeaway'],
      default: 'Dine-In',
      required: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    tax_percentage: {
      type: Number,
      default: 0,
    },
    tax_amount: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    amount_paid: {
      type: Number,
      default: 0,
    },
    change_given: {
      type: Number,
      default: 0,
    },
    payment_method: {
      type: String,
      enum: ['Cash'],
      default: 'Cash',
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Completed',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
