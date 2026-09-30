const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    table_number: {
      type: String,
      required: [true, 'Table number is required'],
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Table capacity is required'],
      min: [1, 'Capacity must be at least 1 person'],
      default: 4,
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Reserved'],
      default: 'Available',
    },
    current_order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Table', tableSchema);
