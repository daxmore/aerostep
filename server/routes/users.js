const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/users
// @desc    Get user by token
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('wishlist');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  let { name, email, password, phone } = req.body;

  // 1. Sanitization
  name = name ? name.trim() : '';
  email = email ? email.trim().toLowerCase() : '';
  password = password ? password : '';
  phone = phone ? phone.replace(/[\s-]/g, '') : '';

  // 2. Validation
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all required fields' });
  }

  // Name Validation
  if (name.length < 2 || name.length > 50) {
    return res.status(400).json({ msg: 'Name must be between 2 and 50 characters' });
  }
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return res.status(400).json({ msg: 'Name can only contain letters, spaces, hyphens, and apostrophes' });
  }

  // Email Validation
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ msg: 'Invalid email format' });
  }

  // Password Validation
  if (password.length < 8) {
    return res.status(400).json({ msg: 'Password must be at least 8 characters' });
  }
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return res.status(400).json({ msg: 'Password must contain uppercase, lowercase, number, and special character' });
  }

  // Phone Validation (Optional)
  if (phone && !/^\+?[0-9]{10,15}$/.test(phone)) {
    return res.status(400).json({ msg: 'Invalid phone number format' });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      phone,
    });

    // Store password as plain text
    user.password = password;

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.cookie('token', token, { httpOnly: true, maxAge: 360000 * 1000 });
        res.json({ msg: 'User registered and logged in' });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      console.log('Login failed: User not found for email:', email);
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Check if user is banned
    if (user.isBanned) {
      console.log('Login failed: User is banned:', email);
      return res.status(403).json({ msg: 'Your account has been banned. Please contact support.' });
    }

    // Compare plain text password
    const isMatch = password === user.password;

    console.log('Login attempt:', { email, passwordProvided: password, passwordStored: user.password, isMatch });

    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.cookie('token', token, { httpOnly: true, maxAge: 360000 * 1000 });
        res.json({
          msg: 'Logged in successfully',
          isAdmin: user.isAdmin || false,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin || false
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, phone, profileImage } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/password
// @desc    Change password
// @access  Private
router.put('/password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Verify old password (plain text comparison)
    if (user.password !== oldPassword) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users/logout
// @desc    Logout user / clear cookie
// @access  Public
router.post('/logout', (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ msg: 'Logged out successfully' });
});

// ==================== WISHLIST ROUTES ====================

// @route   GET api/users/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json(user.wishlist || []);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users/wishlist/:productId
// @desc    Add product to wishlist
// @access  Private
router.post('/wishlist/:productId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.wishlist) {
      user.wishlist = [];
    }

    if (user.wishlist.includes(req.params.productId)) {
      return res.status(400).json({ msg: 'Product already in wishlist' });
    }

    user.wishlist.push(req.params.productId);
    await user.save();

    await user.populate('wishlist');
    res.json(user.wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/users/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/wishlist/:productId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.wishlist) {
      return res.status(404).json({ msg: 'Wishlist is empty' });
    }

    user.wishlist = user.wishlist.filter(
      (productId) => productId.toString() !== req.params.productId
    );

    await user.save();
    await user.populate('wishlist');
    res.json(user.wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==================== ADDRESS ROUTES ====================

// @route   GET api/users/addresses
// @desc    Get all user addresses
// @access  Private
router.get('/addresses', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const addresses = user.addresses || [];
    // Sort by default first
    const sorted = addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
    res.json(sorted);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users/addresses
// @desc    Add new address
// @access  Private
router.post('/addresses', auth, async (req, res) => {
  const { fullName, phone, street, city, state, zipCode, isDefault } = req.body;

  try {
    const user = await User.findById(req.user.id);

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      fullName,
      phone,
      street,
      city,
      state,
      zipCode,
      isDefault: isDefault || false,
    });

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/addresses/:id
// @desc    Update address
// @access  Private
router.put('/addresses/:id', auth, async (req, res) => {
  const { fullName, phone, street, city, state, zipCode, isDefault } = req.body;

  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }

    // If setting as default, remove default from others
    if (isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== req.params.id) {
          addr.isDefault = false;
        }
      });
    }

    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zipCode) address.zipCode = zipCode;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/users/addresses/:id
// @desc    Delete address
// @access  Private
router.delete('/addresses/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }

    address.deleteOne();
    await user.save();
    res.json({ msg: 'Address removed', addresses: user.addresses });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/addresses/:id/default
// @desc    Set address as default
// @access  Private
router.put('/addresses/:id/default', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }

    // Remove default from all other addresses
    user.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === req.params.id;
    });

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

