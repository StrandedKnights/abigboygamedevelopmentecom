import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma';
import { mollieClient } from '../../lib/mollie';

/**
 * PRODUCTION MOLLIE WEBHOOK HANDLER
 * 1. Responds to status changes from Mollie.
 * 2. If 'paid': Fulfills order, permanently decrements stock, clears reservations.
 * 3. If 'failed'/'canceled'/'expired': Marks as CANCELLED, clears reservations.
 */

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const paymentId = formData.get('id') as string;

        if (!paymentId) {
            return new Response('Geen betaling ID gevonden', { status: 400 });
        }

        // 1. Fetch current status from Mollie
        const payment = await mollieClient.payments.get(paymentId);
        const orderId = (payment.metadata as any)?.orderId;

        if (!orderId) {
            // Likely a payment not originating from this flow, ignore
            return new Response('Geen orderId in metadata', { status: 200 });
        }

        // 2. Load order and its items
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!order) {
            return new Response('Order niet gevonden in DB', { status: 200 });
        }

        // 3. Status Handling Logic
        if (payment.status === 'paid' && order.status !== 'PAID') {
            // SUCCESSFUL PAYMENT
            await prisma.order.update({
                where: { id: orderId },
                data: { 
                    status: 'PAID',
                    events: {
                        create: [{
                            type: 'PAYMENT_RECEIVED',
                            details: `Betaling succesvol verwerkt via Mollie (${paymentId}).`
                        }]
                    }
                }
            });

            // Permanent stock deduction & reservation release
            for (const item of order.items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { decrement: item.quantity },
                        reservedUntil: null // Clear soft-lock
                    }
                });
            }

            console.log(`[Checkout] Order ${orderId} successfully PAID.`);

        } else if (['failed', 'expired', 'canceled'].includes(payment.status)) {
            // CANCELLED OR EXPIRED PAYMENT
            await prisma.order.update({
                where: { id: orderId },
                data: { 
                    status: 'CANCELLED',
                    events: {
                        create: [{
                            type: 'PAYMENT_FAILED',
                            details: `Betaling mislukt of geannuleerd. Reden: ${payment.status}.`
                        }]
                    }
                }
            });

            // Release reservations in DB (Restore stock availability)
            const productIds = order.items.map(item => item.productId);
            await prisma.product.updateMany({
                where: { id: { in: productIds } },
                data: { reservedUntil: null }
            });

            console.log(`[Checkout] Order ${orderId} marked as CANCELLED (Mollie status: ${payment.status}).`);
        }

        // Mollie expects a 200 OK to acknowledge the webhook receipt
        return new Response('OK', { status: 200 });

    } catch (e: any) {
        console.error('[Mollie Webhook Error]:', e.message);
        // We still return 200 to Mollie to prevent constant retries on non-recoverable errors
        return new Response('Error handled but acknowledged', { status: 200 });
    }
};
