const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Coupon = require('../models/Coupon');

// @route   GET api/coupons/validate/:code
// @desc    Validate a coupon code
// @access  Private
router.get('/validate/:code', auth, async (req, res) => {
    try {
        const { amount } = req.query;
        const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ msg: 'Invalid coupon code' });
        }

        const validity = coupon.isValid(Number(amount) || 0);
        if (!validity.valid) {
            return res.status(400).json({ msg: validity.msg });
        }

        res.json({
            code: coupon.code,
            discountType: coupon.discountType,
            discountAmount: coupon.discountAmount,
            minOrderAmount: coupon.minOrderAmount
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/coupons/admin/all
// @desc    Get all coupons (Admin only)
// @access  Admin
router.get('/admin/all', adminAuth, async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/coupons/admin
// @desc    Create a new coupon (Admin only)
// @access  Admin
router.post('/admin', adminAuth, async (req, res) => {
    const { code, discountType, discountAmount, minOrderAmount, expiryDate, usageLimit } = req.body;

    try {
        let coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (coupon) {
            return res.status(400).json({ msg: 'Coupon code already exists' });
        }

        coupon = new Coupon({
            code,
            discountType,
            discountAmount,
            minOrderAmount,
            expiryDate,
            usageLimit
        });

        await coupon.save();
        res.json(coupon);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/coupons/admin/:id
// @desc    Update a coupon (Admin only)
// @access  Admin
router.put('/admin/:id', adminAuth, async (req, res) => {
    try {
        let coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ msg: 'Coupon not found' });
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(updatedCoupon);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/coupons/admin/:id
// @desc    Delete a coupon (Admin only)
// @access  Admin
router.delete('/admin/:id', adminAuth, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ msg: 'Coupon not found' });
        }

        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Coupon deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
