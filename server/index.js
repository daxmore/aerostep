require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const connectDB = require('./db');
const cookieParser = require('cookie-parser');

// Connect to database
connectDB();

const app = express();

// Stripe Webhook (MUST BE BEFORE express.json)
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Verification requires STRIPE_WEBHOOK_SECRET in .env
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } else {
            // Fallback for local dev without webhook secret
            event = JSON.parse(req.body);
        }
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const Order = require('./models/Order');
        const Product = require('./models/Product');
        const { sendOrderConfirmation } = require('./utils/email');
        const User = require('./models/User');

        try {
            const order = await Order.findOne({ transactionId: paymentIntent.id }).populate('products.productId');
            if (order && order.paymentStatus !== 'Completed') {
                order.paymentStatus = 'Completed';
                order.status = 'Processing';
                await order.save();

                // Decrement stock
                for (const item of order.products) {
                    await Product.updateOne(
                        { _id: item.productId._id, "sizes.size": String(item.size) },
                        { $inc: { "sizes.$.stock": -item.quantity } }
                    );
                }

                // Send Email
                const user = await User.findById(order.userId);
                if (user) {
                    sendOrderConfirmation(order, user);
                }
            }
        } catch (err) {
            console.error('Error updating order in webhook:', err);
        }
    }

    res.json({ received: true });
});

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cookieParser());

// CORS Middleware - Allow frontend to access backend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
