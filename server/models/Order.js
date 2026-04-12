const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    size: {
      type: Number,
    },
    quantity: {
      type: Number,
      default: 1,
    },
  }],
  totalPrice: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  paymentMethod: {
    type: String,
    default: 'Demo Payment',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending',
  },
  transactionId: {
    type: String,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  couponCode: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Pending',
  },
  returnStatus: {
    type: String,
    enum: ['None', 'Requested', 'Approved', 'Rejected'],
    default: 'None',
  },
  returnRequestedAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  returnReason: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
