const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateInvoice = (order, user, filePath) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Header
            doc.fontSize(25).text('AEROSTEP', { align: 'center' }).moveDown();
            doc.fontSize(10).text('Premium Footwear Experience', { align: 'center' }).moveDown(2);

            doc.fontSize(18).text('INVOICE', { underline: true }).moveDown();

            // Order Info
            doc.fontSize(12)
               .text(`Order ID: #${order._id.toString().slice(-8).toUpperCase()}`)
               .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
               .text(`Status: ${order.paymentStatus}`)
               .moveDown();

            // Bill To
            doc.fontSize(14).text('Bill To:', { bold: true });
            doc.fontSize(12)
               .text(user.name)
               .text(order.shippingAddress.street)
               .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`)
               .text(`Phone: ${order.shippingAddress.phone}`)
               .moveDown();

            // Table Header
            const tableTop = 300;
            doc.fontSize(12).text('Item', 50, tableTop);
            doc.text('Size', 250, tableTop);
            doc.text('Qty', 350, tableTop);
            doc.text('Price', 450, tableTop);

            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            let currentY = tableTop + 30;

            // Items
            order.products.forEach(item => {
                const productTitle = item.productId?.title || 'Product';
                doc.text(productTitle, 50, currentY);
                doc.text(item.size.toString(), 250, currentY);
                doc.text(item.quantity.toString(), 350, currentY);
                doc.text(`INR ${item.productId?.price?.toLocaleString() || '0'}`, 450, currentY);
                currentY += 20;
            });

            doc.moveTo(50, currentY + 10).lineTo(550, currentY + 10).stroke();

            // Calculation
            currentY += 30;
            doc.fontSize(12)
               .text(`Subtotal: INR ${(order.totalPrice + (order.discountAmount || 0)).toLocaleString()}`, 350, currentY)
               .text(`Discount: -INR ${(order.discountAmount || 0).toLocaleString()}`, 350, currentY + 20)
               .fontSize(14)
               .text(`Total Paid: INR ${order.totalPrice.toLocaleString()}`, 350, currentY + 45, { bold: true });

            // Footer
            doc.fontSize(10).text('Thank you for shopping with AeroStep!', 50, 700, { align: 'center', width: 500 });

            stream.on('finish', () => {
                resolve(filePath);
            });

            stream.on('error', (err) => {
                reject(err);
            });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateInvoice };
