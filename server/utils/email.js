const nodemailer = require('nodemailer');

const getBaseTemplate = (content, _previewText) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AeroStep</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f9fafb; }
        .wrapper { width: 100%; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); }
        .header { padding: 40px; text-align: center; background: #0F1720; }
        .header h1 { color: #ffffff; margin: 0; letter-spacing: -1px; font-weight: 900; }
        .header h1 span { color: #0057FF; }
        .content { padding: 40px; }
        .footer { padding: 30px; text-align: center; color: #9ca3af; font-size: 12px; }
        .button { display: inline-block; padding: 16px 32px; background: #0057FF; color: #ffffff !important; text-decoration: none; border-radius: 14px; font-weight: bold; margin: 25px 0; }
        .order-box { background: #f3f4f6; border-radius: 16px; padding: 25px; margin: 20px 0; }
        .label { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px; }
        .text-bold { font-weight: bold; color: #0F1720; }
        .divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>AERO<span>STEP</span></h1>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} AeroStep. All rights reserved.<br>
                Premium Footwear & Performance Experience.
            </div>
        </div>
    </div>
</body>
</html>
`;

const sendEmail = async (options) => {
    // Create transporter with service shortcut for better Gmail compatibility
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM || `"AeroStep" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    try {
        console.log(`📧 Attempting to send email to: ${options.email}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully! MessageId: ${info.messageId}`);
    } catch (err) {
        console.error('❌ Email sending failed!');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        
        if (err.code === 'EAUTH') {
            console.error('💡 HINT: Authentication failed. Please verify your Gmail "App Password". Regular passwords will not work.');
        } else if (err.code === 'ESOCKET') {
            console.error('💡 HINT: Connection failed. This may be due to a local firewall or your ISP blocking SMTP ports.');
        }
    }
};

const sendOrderConfirmation = async (order, user) => {
    const itemsHtml = order.products.map(item => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span class="text-bold">${item.productId?.title || 'Product'} (Size ${item.size})</span>
            <span>x${item.quantity}</span>
        </div>
    `).join('');

    const html = getBaseTemplate(`
        <h2 style="margin-top:0">Order Confirmed!</h2>
        <p>Hi ${user.name}, your order has been received and is being prepared for takeoff.</p>
        
        <div class="order-box">
            <div class="label">Order ID</div>
            <div class="text-bold">#${order._id.toString().toUpperCase()}</div>
            <div class="divider"></div>
            ${itemsHtml}
            <div class="divider"></div>
            <div style="display: flex; justify-content: space-between;">
                <span class="text-bold">Total Amount Paid</span>
                <span class="text-bold" style="color: #0057FF; font-size: 18px;">₹${order.totalPrice.toLocaleString('en-IN')}</span>
            </div>
        </div>

        <p>You can track your order progress in your dashboard.</p>
        <center><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" class="button">Track My Order</a></center>
    `);

    await sendEmail({
        email: user.email,
        subject: `Your AeroStep Order #${order._id.toString().slice(-6).toUpperCase()} is Confirmed!`,
        html
    });
};

const sendReturnRequestNotification = async (order, user) => {
    const html = getBaseTemplate(`
        <h2 style="margin-top:0">Return Requested</h2>
        <p>Hi ${user.name}, we've received your return request for Order #${order._id.toString().slice(-8).toUpperCase()}.</p>
        
        <div class="order-box" style="border-left: 4px solid #f59e0b;">
            <div class="label">Status</div>
            <div class="text-bold">Under Review</div>
            <div class="divider"></div>
            <p style="margin:0; font-size: 14px;">Our logistics team will verify the request and update you within 24-48 hours.</p>
        </div>

        <p>We'll notify you via email once the status changes.</p>
    `);

    await sendEmail({
        email: user.email,
        subject: `Return Request Received - Order #${order._id.toString().slice(-6).toUpperCase()}`,
        html
    });
};

const sendReturnStatusUpdate = async (order, user) => {
    const color = order.returnStatus === 'Approved' ? '#10b981' : '#ef4444';
    
    const html = getBaseTemplate(`
        <h2 style="margin-top:0">Return Status Update</h2>
        <p>Hi ${user.name}, your return request status has been updated.</p>
        
        <div class="order-box" style="border-left: 4px solid ${color};">
            <div class="label">New Status</div>
            <div class="text-bold" style="color: ${color}; text-transform: uppercase;">${order.returnStatus}</div>
        </div>

        <p>Log in to your dashboard to see more details.</p>
        <center><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" class="button">View Details</a></center>
    `);

    await sendEmail({
        email: user.email,
        subject: `Update: Return Request #${order._id.toString().slice(-6).toUpperCase()}`,
        html
    });
};

const sendAbandonedCartEmail = async (user, cartItems) => {
    const itemsHtml = cartItems.map(item => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
            <span class="text-bold">${item.productId?.title || 'Premium Sneaker'}</span>
            <span style="color: #6b7280;">Size ${item.size}</span>
        </div>
    `).join('');

    const html = getBaseTemplate(`
        <h2 style="margin-top:0">Still thinking about it?</h2>
        <p>Hi ${user.name}, we noticed you have some items sitting in your cart. They're waiting to fly!</p>
        
        <div class="order-box">
            <div class="label">Waiting in your cart</div>
            <div class="divider" style="margin: 15px 0 10px 0;"></div>
            ${itemsHtml}
            <div class="divider" style="margin: 10px 0 15px 0;"></div>
            <p style="margin:0; font-size: 13px; color: #6b7280;">Items in your cart are not reserved and may sell out soon.</p>
        </div>

        <center><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart" class="button">Complete My Order</a></center>
    `);

    await sendEmail({
        email: user.email,
        subject: `Don't miss out on your AeroStep favorites!`,
        html
    });
};

const sendWelcomeEmail = async (user) => {
    const html = getBaseTemplate(`
        <h2 style="margin-top:0">Welcome to AeroStep!</h2>
        <p>Hi ${user.name}, we're thrilled to have you in our community of performance enthusiasts.</p>
        
        <div class="order-box">
            <p style="margin:0">Get ready to experience footwear that combines cutting-edge technology with high-end editorial design.</p>
        </div>

        <p>Start exploring our latest collections today.</p>
        <center><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/shop" class="button">Explore the Collection</a></center>
    `);

    await sendEmail({
        email: user.email,
        subject: `Welcome to AeroStep - Your Performance Journey Starts Here!`,
        html
    });
};

module.exports = {
    sendOrderConfirmation,
    sendReturnRequestNotification,
    sendReturnStatusUpdate,
    sendAbandonedCartEmail,
    sendWelcomeEmail
};
