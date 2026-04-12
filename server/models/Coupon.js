const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage',
    },
    discountAmount: {
        type: Number,
        required: [true, 'Discount amount is required'],
        min: [0, 'Discount cannot be negative'],
    },
    minOrderAmount: {
        type: Number,
        default: 0,
    },
    expiryDate: {
        type: Date,
        required: [true, 'Expiry date is required'],
    },
    usageLimit: {
        type: Number,
        default: 100, // Total number of times this coupon can be used
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Check if coupon is valid
couponSchema.methods.isValid = function (orderAmount = 0) {
    const now = new Date();
    if (!this.isActive) return { valid: false, msg: 'Coupon is inactive' };
    if (this.expiryDate < now) return { valid: false, msg: 'Coupon has expired' };
    if (this.usedCount >= this.usageLimit) return { valid: false, msg: 'Coupon usage limit reached' };
    if (orderAmount < this.minOrderAmount) return { valid: false, msg: `Minimum order amount of ₹${this.minOrderAmount} required` };
    
    return { valid: true };
};

module.exports = mongoose.model('Coupon', couponSchema);
