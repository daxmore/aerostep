const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Sale name is required'],
    },
    discountPercentage: {
        type: Number,
        required: [true, 'Discount percentage is required'],
        min: 0,
        max: 100,
    },
    category: {
        type: String,
        default: 'All', // 'All' or specific category like 'Sneakers'
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    bannerImage: {
        type: String, // Optional URL for the sale banner
    }
}, { timestamps: true });

// Static method to get active sale for a category
saleSchema.statics.getActiveSale = async function(category = 'All') {
    const now = new Date();
    return await this.findOne({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [{ category: 'All' }, { category: category }]
    }).sort({ discountPercentage: -1 }); // Get highest discount if multiple
};

module.exports = mongoose.model('Sale', saleSchema);
