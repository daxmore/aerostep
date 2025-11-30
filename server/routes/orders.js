const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

// @route   POST api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, async (req, res) => {
  const { addressId } = req.body;

  try {
    const cartItems = await Cart.find({ userId: req.user.id }).populate('productId');

    if (cartItems.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    if (!addressId) {
      return res.status(400).json({ msg: 'Shipping address is required' });
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

    const products = cartItems.map(item => ({
      productId: item.productId._id,
      size: item.size,
      quantity: item.quantity,
    }));

    const totalPrice = cartItems.reduce((acc, item) => acc + item.productId.price * item.quantity, 0);

    const order = new Order({
      userId: req.user.id,
      products,
      totalPrice,
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
      },
      paymentMethod: 'Demo Payment',
    });

    await order.save();

    // Clear the cart after creating the order
    await Cart.deleteMany({ userId: req.user.id });

    res.json(order);
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

    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
