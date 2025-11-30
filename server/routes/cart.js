const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @route   GET api/cart
// @desc    Get user cart
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.find({ userId: req.user.id }).populate('productId');
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', auth, async (req, res) => {
  const { productId, quantity, size } = req.body;

  try {
    // Get product to check stock
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // If size is provided, check size-specific stock
    if (size) {
      const sizeOption = product.sizes.find(s => s.size === size);

      if (!sizeOption) {
        return res.status(400).json({ msg: `Size ${size} not available for this product` });
      }

      if (sizeOption.stock < quantity) {
        return res.status(400).json({ msg: `Only ${sizeOption.stock} items available for size ${size}` });
      }
    }

    // Check if item with same product and size already in cart
    let cartItem = await Cart.findOne({
      userId: req.user.id,
      productId,
      size: size || null
    });

    if (cartItem) {
      // Check if adding more won't exceed stock
      if (size) {
        const sizeOption = product.sizes.find(s => s.size === size);
        if (sizeOption.stock < cartItem.quantity + quantity) {
          return res.status(400).json({
            msg: `Only ${sizeOption.stock} items available for size ${size}`
          });
        }
      }
      cartItem.quantity += quantity;
    } else {
      cartItem = new Cart({
        userId: req.user.id,
        productId,
        size,
        quantity,
      });
    }

    await cartItem.save();
    await cartItem.populate('productId');
    res.json(cartItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/cart/:id
// @desc    Update cart item quantity
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { quantity } = req.body;

  try {
    let cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
      return res.status(404).json({ msg: 'Cart item not found' });
    }

    if (cartItem.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();
    res.json(cartItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/cart/:id
// @desc    Delete cart item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
      return res.status(404).json({ msg: 'Cart item not found' });
    }

    if (cartItem.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await cartItem.deleteOne();
    res.json({ msg: 'Cart item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
