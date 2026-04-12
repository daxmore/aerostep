const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Sale = require('../models/Sale');
const { sendReturnStatusUpdate, sendAbandonedCartEmail } = require('../utils/email');

// ==================== DASHBOARD ====================

// @route   GET api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        const orders = await Order.find();
        const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);

        res.json({
            totalUsers,
            totalProducts,
            totalOrders,
            totalSales,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==================== PRODUCTS ====================

// @route   POST api/admin/products
// @desc    Create a new product
// @access  Admin
router.post('/products', adminAuth, async (req, res) => {
    const { title, description, price, images, sizes, category, tags, featured } = req.body;

    // Validation
    if (!title || title.length < 3) {
        return res.status(400).json({ msg: 'Title must be at least 3 characters' });
    }

    if (!description || description.length < 20) {
        return res.status(400).json({ msg: 'Description must be at least 20 characters' });
    }

    if (!price || price <= 0) {
        return res.status(400).json({ msg: 'Price must be a positive number' });
    }

    if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
        return res.status(400).json({ msg: 'At least one size with stock is required' });
    }

    // Validate sizes
    for (const sizeObj of sizes) {
        if (!sizeObj.size || sizeObj.stock < 0) {
            return res.status(400).json({ msg: 'Invalid size or stock value' });
        }
    }

    // Validate Images
    if (!images || !images.primary) {
        return res.status(400).json({ msg: 'Primary image is required' });
    }

    // Default thumbnail to primary image if not provided
    const productImages = {
        primary: images.primary,
        thumbnail: images.thumbnail || images.primary,
        gallery: images.gallery || []
    };

    try {
        const product = new Product({
            title,
            description,
            price: Number(price),
            images: productImages,
            sizes,
            category,
            tags: tags || [],
            featured: featured || false,
        });

        await product.save();
        res.json(product);
    } catch (err) {
        console.error('Product creation error:', err.message);
        res.status(500).json({ msg: 'Server error creating product', error: err.message });
    }
});

// @route   PUT api/admin/products/:id
// @desc    Update a product
// @access  Admin
router.put('/products/:id', adminAuth, async (req, res) => {
    const { title, description, price, images, sizes, category, tags, featured } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Validation
        if (title !== undefined && title.length < 3) {
            return res.status(400).json({ msg: 'Title must be at least 3 characters' });
        }

        if (description !== undefined && description.length < 20) {
            return res.status(400).json({ msg: 'Description must be at least 20 characters' });
        }

        if (price !== undefined && price <= 0) {
            return res.status(400).json({ msg: 'Price must be a positive number' });
        }

        // Update fields - only update if provided and not empty
        if (title) product.title = title;
        if (description) product.description = description;
        if (price) product.price = Number(price);
        if (category) product.category = category;
        if (sizes) product.sizes = sizes;
        if (tags) product.tags = tags;
        if (featured !== undefined) product.featured = featured;

        // Handle images - only update if provided and has valid data
        if (images) {
            if (images.primary && images.primary.trim()) product.images.primary = images.primary;
            if (images.thumbnail && images.thumbnail.trim()) product.images.thumbnail = images.thumbnail;
            if (images.gallery && images.gallery.some(url => url && url.trim())) {
                product.images.gallery = images.gallery.filter(url => url && url.trim());
            }
        }

        await product.save();
        res.json(product);
    } catch (err) {
        console.error('Product update error:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).json({ msg: 'Server error updating product', error: err.message });
    }
});

// @route   DELETE api/admin/products/:id
// @desc    Delete a product
// @access  Admin
router.delete('/products/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        await product.deleteOne();
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server Error');
    }
});

// ==================== ORDERS ====================

// @route   GET api/admin/orders
// @desc    Get all orders with optional filter
// @access  Admin
router.get('/orders', adminAuth, async (req, res) => {
    try {
        const { status, search } = req.query;

        let filter = {};
        if (status && status !== 'All') {
            filter.status = status;
        }

        // Search by short ID (last 8 characters)
        if (search) {
            const cleanSearch = search.trim();
            // If it starts with #, strip it
            const searchTerm = cleanSearch.startsWith('#') ? cleanSearch.substring(1) : cleanSearch;
            
            if (searchTerm.length === 8) {
                // MongoDB doesn't allow regex on ObjectIds directly in find, 
                // so we use $expr to convert _id to string and check the suffix.
                filter.$expr = {
                    $eq: [
                        { $substr: [{ $toString: "$_id" }, { $subtract: [{ $strLenCP: { $toString: "$_id" } }, 8] }, 8] },
                        searchTerm.toLowerCase()
                    ]
                };
            } else if (searchTerm.length > 8) {
              // Try searching by full ID if provided
              try {
                if (/^[0-9a-fA-F]{24}$/.test(searchTerm)) {
                  filter._id = searchTerm;
                }
              } catch (_e) { /* ignore invalid ObjectID */ }
            }
        }

        const orders = await Order.find(filter)
            .populate('userId', 'name email')
            .populate('products.productId', 'title images')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/orders/:id
// @desc    Get order details
// @access  Admin
router.get('/orders/:id', adminAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('products.productId', 'title images price');

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
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

// @route   PUT api/admin/orders/:id/status
// @desc    Update order status
// @access  Admin
router.put('/orders/:id/status', adminAuth, async (req, res) => {
    const { status } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ msg: 'Invalid status' });
    }

    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Prevent invalid transitions (e.g., Delivered -> Pending)
        if (order.status === 'Delivered' && status !== 'Delivered') {
            return res.status(400).json({ msg: 'Cannot change status of delivered order' });
        }

        order.status = status;
        
        if (status === 'Delivered') {
            order.deliveredAt = new Date();
        }

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

// @route   DELETE api/admin/orders/:id
// @desc    Cancel/delete an order
// @access  Admin
router.delete('/orders/:id', adminAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        await order.deleteOne();
        res.json({ msg: 'Order removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.status(500).send('Server Error');
    }
});

// ==================== USERS ====================

// @route   GET api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/users/:id
// @desc    Get user details with order history
// @access  Admin
router.get('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const orders = await Order.find({ userId: req.params.id })
            .populate('products.productId', 'title images price')
            .sort({ createdAt: -1 });

        res.json({ ...user.toObject(), orders });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/users/:id/role
// @desc    Promote/demote user (toggle isAdmin)
// @access  Admin
router.put('/users/:id/role', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Toggle admin status
        user.isAdmin = !user.isAdmin;
        await user.save();

        res.json({ msg: `User ${user.isAdmin ? 'promoted to' : 'demoted from'} admin`, user });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/users/:id/ban
// @desc    Ban/Unban a user (toggle isBanned)
// @access  Admin
router.put('/users/:id/ban', adminAuth, async (req, res) => {
    try {
        // Prevent admin from banning themselves
        if (req.user.id === req.params.id) {
            return res.status(400).json({ msg: 'Cannot ban your own account' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Prevent banning other admins
        if (user.isAdmin) {
            return res.status(400).json({ msg: 'Cannot ban admin users' });
        }

        // Toggle ban status
        user.isBanned = !user.isBanned;
        await user.save();

        res.json({ msg: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`, user });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        // Prevent admin from deleting themselves
        if (req.user.id === req.params.id) {
            return res.status(400).json({ msg: 'Cannot delete your own account' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        await user.deleteOne();
        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// ==================== SALES ====================

// @route   GET api/admin/sales
// @desc    Get all sales
// @access  Admin
router.get('/sales', adminAuth, async (req, res) => {
    try {
        const sales = await Sale.find().sort({ createdAt: -1 });
        res.json(sales);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/sales
// @desc    Create a new sale
// @access  Admin
router.post('/sales', adminAuth, async (req, res) => {
    const { name, discountPercentage, category, startDate, endDate, isActive } = req.body;
    try {
        const sale = new Sale({ name, discountPercentage, category, startDate, endDate, isActive });
        await sale.save();
        res.json(sale);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/admin/sales/:id
// @desc    Delete a sale
// @access  Admin
router.delete('/sales/:id', adminAuth, async (req, res) => {
    try {
        await Sale.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Sale deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH api/admin/orders/:id/return-status
// @desc    Approve or reject a return request
// @access  Admin
router.patch('/orders/:id/return-status', adminAuth, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['Approved', 'Rejected'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ msg: 'Invalid return status' });
    }

    try {
        const order = await Order.findById(req.params.id).populate('userId', 'name email');

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        if (order.returnStatus !== 'Requested') {
            return res.status(400).json({ msg: 'No pending return request for this order' });
        }

        order.returnStatus = status;
        if (status === 'Approved') {
            order.status = 'Returned';
            // Optional: Restore stock when return is approved
            for (const item of order.products) {
                await Product.updateOne(
                    { _id: item.productId, "sizes.size": item.size },
                    { $inc: { "sizes.$.stock": item.quantity } }
                );
            }
        }
        
        await order.save();

        // Send notification email
        sendReturnStatusUpdate(order, order.userId, status);

        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/trigger-abandoned-emails
// @desc    Send reminder emails for carts abandoned for > 24 hours
// @access  Admin
router.post('/trigger-abandoned-emails', adminAuth, async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        // Find carts updated between 24 and 48 hours ago
        const abandonedCarts = await Cart.find({
            updatedAt: { $gte: fortyEightHoursAgo, $lte: twentyFourHoursAgo }
        }).populate('userId', 'name email').populate('productId');

        // Group by user (if multiple products in cart)
        const userCarts = {};
        abandonedCarts.forEach(item => {
            if (!item.userId) return;
            const userId = item.userId._id.toString();
            if (!userCarts[userId]) {
                userCarts[userId] = {
                    user: item.userId,
                    items: []
                };
            }
            userCarts[userId].items.push(item);
        });

        let emailsSent = 0;
        for (const userId in userCarts) {
            const data = userCarts[userId];
            // Check if user has already placed an order after the cart was updated
            const recentOrder = await Order.findOne({
                userId: userId,
                createdAt: { $gt: twentyFourHoursAgo }
            });

            if (!recentOrder) {
                await sendAbandonedCartEmail(data.user, data.items);
                emailsSent++;
            }
        }

        res.json({ msg: `Successfully triggered ${emailsSent} abandoned cart recovery emails` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
