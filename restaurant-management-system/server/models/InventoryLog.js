const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema(
  {
    menu_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    change_qty: {
      type: Number,
      required: true,
    },
    stock_after: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
      required: true,
      enum: ['Order Sale', 'Restock', 'Waste / Damaged', 'Manual Adjustment', 'Initial Stock', 'Order Cancelled Refund'],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
