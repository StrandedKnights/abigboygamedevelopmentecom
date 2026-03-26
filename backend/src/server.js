const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const { createMollieClient } = require('@mollie/api-client');
const axios = require('axios');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY || 'test_dummy_key' });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. GET /api/products
app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. POST /api/checkout
app.post('/api/checkout', async (req, res) => {
    try {
        const { productIds, customerEmail, customerName } = req.body;
        
        if (!productIds || productIds.length === 0) {
            return res.status(400).json({ error: 'No products provided' });
        }

        // Fetch products to calculate total
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } }
        });

        if (products.length !== productIds.length) {
            return res.status(400).json({ error: 'Some products were not found' });
        }

        let totalAmountInCents = 0;
        const orderItemsData = [];

        products.forEach(product => {
            totalAmountInCents += product.priceInCents;
            orderItemsData.push({
                productId: product.id,
                quantity: 1, // Simplifying: assuming 1 of each for this array of IDs
                priceAtPurchaseInCents: product.priceInCents
            });
        });

        // Create Order
        const order = await prisma.order.create({
            data: {
                customerEmail: customerEmail || 'guest@example.com',
                customerName: customerName || 'Guest User',
                totalAmountInCents,
                items: {
                    create: orderItemsData
                }
            }
        });

        // Format amount for Mollie (e.g., 1000 cents -> "10.00")
        const valueInEuros = (totalAmountInCents / 100).toFixed(2);

        // Call Mollie
        const payment = await mollieClient.payments.create({
            amount: {
                currency: 'EUR',
                value: valueInEuros
            },
            description: `Order ${order.id}`,
            redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:4321'}/success?orderId=${order.id}`,
            webhookUrl: `${process.env.NGROK_URL || 'https://example.com'}/api/webhook`, // Mollie needs a public URL
            metadata: {
                orderId: order.id
            }
        });

        // Update order with payment ID
        await prisma.order.update({
            where: { id: order.id },
            data: { molliePaymentId: payment.id }
        });

        const checkoutUrl = payment._links.checkout.href;
        res.json({ checkoutUrl, orderId: order.id });

    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Error initiating checkout' });
    }
});

// 3. POST /api/webhook
app.post('/api/webhook', async (req, res) => {
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.status(400).send('Missing ID');
        }

        const payment = await mollieClient.payments.get(id);
        
        const orderId = payment.metadata.orderId;
        
        let status = 'PENDING';
        if (payment.isPaid()) {
            status = 'PAID';
        } else if (payment.isCanceled()) {
            status = 'CANCELED';
        } else if (payment.isExpired()) {
            status = 'EXPIRED';
        } else if (payment.isFailed()) {
            status = 'FAILED';
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Error processing webhook');
    }
});

// 4. POST /api/admin/upload-by-url
app.post('/api/admin/upload-by-url', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({ error: 'Missing imageUrl' });
        }

        const response = await axios({
            url: imageUrl,
            responseType: 'arraybuffer'
        });

        const buffer = Buffer.from(response.data, 'binary');
        
        const filename = `${uuidv4()}.webp`;
        const filepath = path.join(uploadDir, filename);

        await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(filepath);

        const localUrl = `/uploads/${filename}`;
        res.json({ localUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Error processing image upload' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
