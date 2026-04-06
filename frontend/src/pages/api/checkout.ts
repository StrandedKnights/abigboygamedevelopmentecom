import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma';
import { mollieClient } from '../../lib/mollie';

/**
 * PRODUCTION CHECKOUT HANDLER
 * 1. Validates Cart & Customer Data
 * 2. Fetches Real-time Prices & Stock from DB
 * 3. Applies Soft-Lock (15m Reservation)
 * 4. Creates PENDING Order in Database
 * 5. Initiates Mollie Payment and returns redirect URL
 */

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { cartItems: clientCart, customerData } = body;

        if (!clientCart || clientCart.length === 0) {
            return new Response(JSON.stringify({ error: 'Winkelmand is leeg.' }), { status: 400 });
        }

        if (!customerData || !customerData.email) {
            return new Response(JSON.stringify({ error: 'Klantgegevens ontbreken.' }), { status: 400 });
        }

        // 1. Fetch real prices and stock from DB (Prevents client-side manipulation)
        const productIds = clientCart.map((item: any) => item.id);
        const dbProducts = await prisma.product.findMany({
            where: { id: { in: productIds } }
        });

        let totalAmountInCents = 0;
        const validOrderItems = [];

        for (const item of clientCart) {
            const dbProduct = dbProducts.find(p => p.id === item.id);
            if (!dbProduct) {
                return new Response(JSON.stringify({ error: `Product ${item.id} niet gevonden.` }), { status: 404 });
            }

            // Check stock / current reservations
            const isReserved = dbProduct.reservedUntil && dbProduct.reservedUntil > new Date();
            if (dbProduct.stock <= 0 || isReserved) {
                return new Response(JSON.stringify({ 
                    error: `${dbProduct.title} is helaas niet meer beschikbaar (mogelijk net verkocht of gereserveerd).` 
                }), { status: 409 });
            }

            // Use Discount Price if available, else standard price
            let unitPrice = dbProduct.discountPriceInCents || dbProduct.priceInCents;
            
            // Dynamic 10% discount for weekdeals
            if (dbProduct.isWeekdeal && !dbProduct.discountPriceInCents) {
                unitPrice = Math.round(dbProduct.priceInCents * 0.9);
            }

            totalAmountInCents += unitPrice * item.quantity;

            validOrderItems.push({
                productId: dbProduct.id,
                quantity: item.quantity,
                priceAtPurchaseInCents: unitPrice,
                purchasePriceAtPurchaseInCents: dbProduct.purchasePriceInCents,
                taxScheme: dbProduct.taxScheme
            });
        }

        // 2. Create Order in Database (Status: PENDING)
        // We do this BEFORE Mollie to have an Order ID for metadata
        const order = await prisma.order.create({
            data: {
                customerEmail: customerData.email,
                customerName: `${customerData.firstName} ${customerData.lastName}`,
                totalAmountInCents,
                status: 'PENDING',
                items: {
                    create: validOrderItems
                },
                events: {
                    create: [{
                        type: 'ORDER_CREATED',
                        details: 'Klant gestart met checkout. Wacht op betaling.'
                    }]
                }
            }
        });

        // 3. Initiate Soft-Lock (15-minute reservation)
        const reservationTime = new Date(Date.now() + 15 * 60 * 1000);
        await prisma.product.updateMany({
            where: { id: { in: productIds } },
            data: { reservedUntil: reservationTime }
        });

        // 4. Create Mollie Payment
        const siteUrl = import.meta.env.FRONTEND_URL || new URL(request.url).origin;
        
        try {
            const payment = await mollieClient.payments.create({
                amount: {
                    currency: 'EUR',
                    value: (totalAmountInCents / 100).toFixed(2)
                },
                description: `A Big Boy's Game — Bestelling #${order.id.slice(-6)}`,
                redirectUrl: `${siteUrl}/checkout/success?orderId=${order.id}`,
                webhookUrl: `${siteUrl}/api/mollie-webhook`, // Ensure this matches your public endpoint
                metadata: {
                    orderId: order.id
                }
            });

            // Update order with Mollie ID for tracking
            await prisma.order.update({
                where: { id: order.id },
                data: { molliePaymentId: payment.id }
            });

            return new Response(JSON.stringify({
                status: 'success',
                paymentUrl: (payment as any).getCheckoutUrl(),
                orderId: order.id
            }), { status: 200 });

        } catch (mollieError: any) {
            console.error('[Mollie Error]:', mollieError.message);
            
            // Clean up: Release soft-lock since payment creation failed
            await prisma.product.updateMany({
                where: { id: { in: productIds } },
                data: { reservedUntil: null }
            });

            return new Response(JSON.stringify({ 
                error: 'Fout bij het aanmaken van de betaling bij Mollie.',
                message: mollieError.message 
            }), { status: 500 });
        }

    } catch (e: any) {
        console.error('[Checkout Error]:', e.message);
        return new Response(JSON.stringify({ error: 'Interne serverfout bij checkout.' }), { status: 500 });
    }
};
