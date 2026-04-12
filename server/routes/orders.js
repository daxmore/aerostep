const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Sale = require('../models/Sale');
const { sendReturnRequestNotification } = require('../utils/email');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @route   POST api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, async (req, res) => {
  const { addressId, couponCode } = req.body;
  console.log('POST /api/orders request received:', { addressId, couponCode, user: req.user.id });

  try {
    const cartItems = await Cart.find({ userId: req.user.id }).populate('productId');

    if (cartItems.length === 0) {
      console.warn(`⚠️ Order failed: Cart is empty for user ${req.user.id}`);
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    if (!addressId) {
      console.warn(`⚠️ Order failed: No addressId provided by user ${req.user.id}`);
      return res.status(400).json({ msg: 'Shipping address is required' });
    }

    // 1. Check Inventory before proceeding
    for (const item of cartItems) {
      const product = item.productId;
      if (!product) {
        console.warn(`⚠️ Order failed: Product is missing for cart item ${item._id}`);
        return res.status(400).json({ msg: 'One or more products in your cart are no longer available.' });
      }

      const sizeEntry = product.sizes.find(s => String(s.size) === String(item.size));

      if (!sizeEntry) {
        console.warn(`⚠️ Order failed: Size ${item.size} not found for product ${product.title}`);
        return res.status(400).json({ msg: `Size ${item.size} not found for ${product.title}` });
      }

      if (sizeEntry.stock < item.quantity) {
        console.warn(`⚠️ Order failed: Insufficient stock for ${product.title}. Requested: ${item.quantity}, Available: ${sizeEntry.stock}`);
        return res.status(400).json({ msg: `Insufficient stock for ${product.title} (Size: ${item.size}). Requested: ${item.quantity}, Available: ${sizeEntry.stock}` });
      }
    }

    // Get user with addresses
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Find address in user's addresses array
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }



    // Fetch active sales to calculate real backend price
    const activeSales = await Sale.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    let finalTotalPrice = cartItems.reduce((acc, item) => {
      const product = item.productId;
      const sale = activeSales.find(s => s.category === 'All' || s.category === product.category);
      const unitPrice = sale 
        ? Math.floor(product.price * (1 - sale.discountPercentage / 100))
        : product.price;
        
      return acc + unitPrice * item.quantity;
    }, 0);

    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      appliedCoupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (appliedCoupon) {
        const validity = appliedCoupon.isValid(finalTotalPrice);
        if (validity.valid) {
          if (appliedCoupon.discountType === 'percentage') {
            discountAmount = (finalTotalPrice * appliedCoupon.discountAmount) / 100;
          } else {
            discountAmount = appliedCoupon.discountAmount;
          }
          // Ensure discount doesn't exceed total price
          discountAmount = Math.min(discountAmount, finalTotalPrice);
          finalTotalPrice -= discountAmount;
        } else {
          // If coupon is provided but invalid, we could return error or just ignore it. 
          // Best to return error so user knows why price didn't drop.
          return res.status(400).json({ msg: validity.msg });
        }
      } else {
        return res.status(400).json({ msg: 'Invalid coupon code' });
      }
    }

    // Fetch address detail (redundant check, but kept for clarity)
    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalTotalPrice * 100), // In paise
      currency: 'inr',
      metadata: { userId: req.user.id },
      automatic_payment_methods: { enabled: true },
    });

    const order = new Order({
      userId: req.user.id,
      products: cartItems.map(item => ({
        productId: item.productId._id,
        size: item.size,
        quantity: item.quantity,
      })),
      totalPrice: finalTotalPrice,
      discountAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
      },
      paymentMethod: 'Stripe',
      transactionId: paymentIntent.id,
      paymentStatus: 'Pending',
    });

    await order.save();

    // If coupon used, increment count (We'll do this after payment confirm in webhook ideally, but here for now)
    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      await appliedCoupon.save();
    }

    // Clear the cart
    await Cart.deleteMany({ userId: req.user.id });

    res.json({
      order,
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders
// @desc    Get user orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate('products.productId');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/orders/:orderId/cancel
// @desc    Cancel an order
// @access  Private
router.patch('/:orderId/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to cancel this order' });
    }

    // Only allow cancellation for Pending or Processing orders
    if (order.status !== 'Pending' && order.status !== 'Processing') {
      return res.status(400).json({ msg: `Cannot cancel order with status: ${order.status}` });
    }

    order.status = 'Cancelled';
    await order.save();

    // Restore stock
    for (const item of order.products) {
      await Product.updateOne(
        { _id: item.productId, "sizes.size": item.size },
        { $inc: { "sizes.$.stock": item.quantity } }
      );
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/orders/:orderId/return
// @desc    Request a return for an order
// @access  Private
router.patch('/:orderId/return', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if order belongs to user
    if (order.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({ msg: 'Only delivered orders can be returned' });
    }

    // Check 3-day window
    const now = new Date();
    const deliveredDate = order.deliveredAt || order.updatedAt; // Fallback if deliveredAt is missing
    const diffTime = Math.abs(now - deliveredDate);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays > 3) {
      return res.status(400).json({ msg: 'Return request period (3 days) has expired' });
    }

    if (order.returnStatus !== 'None') {
      return res.status(400).json({ msg: 'Return has already been requested or processed' });
    }

    const { reason } = req.body;

    order.returnStatus = 'Requested';
    order.returnRequestedAt = new Date();
    order.returnReason = reason;
    await order.save();

    // Send return request email
    const user = await User.findById(req.user.id);
    if (user) {
      sendReturnRequestNotification(order, user);
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders/:id/invoice
// @desc    Download PDF invoice
// @access  Private
router.get('/:id/invoice', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.productId');
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Verify ownership or Admin status
    if (order.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const user = await User.findById(order.userId);
    const invoiceDir = path.join(__dirname, '../temp/invoices');
    
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    const fileName = `invoice-${order._id}.pdf`;
    const filePath = path.join(invoiceDir, fileName);

    const { generateInvoice } = require('../utils/invoice');
    await generateInvoice(order, user, filePath);

    res.download(filePath, `AeroStep-Invoice-${order._id.toString().slice(-6)}.pdf`, (err) => {
        if (err) console.error('Error sending file:', err);
        // Clean up internal file after download
        fs.unlink(filePath, (err) => { if (err) console.error('Error deleting temp invoice:', err); });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/orders/transaction/:transactionId
// @desc    Get order by transactionId
// @access  Public
router.get('/transaction/:transactionId', async (req, res) => {
  try {
    const order = await Order.findOne({ transactionId: req.params.transactionId }).populate('products.productId');
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
