import type { APIRoute } from 'astro';
import prisma from '../../../../../lib/prisma';
import { mollieClient } from '../../../../../lib/mollie';

/**
 * REFUND HANDLER
 * 1. Checks if order was PAID or SHIPPED.
 * 2. Fetches the Mollie Payment ID.
 * 3. Triggers refund via Mollie API.
 * 4. Updates DB status to REFUNDED.
 * 5. Restocks items.
 */
export const POST: APIRoute = async ({ params }) => {
    try {
        const { id } = params;
        if (!id) return new Response(JSON.stringify({ error: 'Order ID ontbreekt' }), { status: 400 });

        // 1. Get Order
        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!order) return new Response(JSON.stringify({ error: 'Order niet gevonden' }), { status: 404 });
        
        // Allow refunding PAID or SHIPPED orders
        if (order.status !== 'PAID' && order.status !== 'SHIPPED') {
            return new Response(JSON.stringify({ error: 'Alleen betaalde of verzonden orders kunnen worden terugbetaald.' }), { status: 400 });
        }
        
        if (!order.molliePaymentId) {
            return new Response(JSON.stringify({ error: 'Geen Mollie betalingskenmerk gevonden voor deze order.' }), { status: 400 });
        }

        // 2. Trigger Mollie Refund
        try {
            // Correct Mollie SDK method for refunds on a specific payment
            await mollieClient.paymentRefunds.create({
                paymentId: order.molliePaymentId,
                amount: {
                    currency: 'EUR',
                    value: (order.totalAmountInCents / 100).toFixed(2)
                },
                description: `Terugbetaling voor Order #${order.id.slice(-6)}`
            });
        } catch (mollieErr: any) {
            console.error('[Mollie Refund Error]:', mollieErr.message);
            return new Response(JSON.stringify({ error: `Mollie Refund mislukt: ${mollieErr.message}` }), { status: 500 });
        }

        // 3. Update Database
        await prisma.order.update({
            where: { id },
            data: { 
                status: 'REFUNDED' as any,
                events: {
                    create: [{
                        type: 'REFUND_ISSUED',
                        details: `Volledige terugbetaling uitgevoerd via Mollie.`
                    }]
                }
            }
        });

        // 4. Restock Items
        for (const item of order.items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } }
            });
        }

        return new Response(JSON.stringify({ 
            status: 'success', 
            message: 'Terugbetaling succesvol verwerkt en voorraad bijgewerkt.' 
        }), { status: 200 });

    } catch (e: any) {
        console.error('[Refund API Error]:', e.message);
        return new Response(JSON.stringify({ error: 'Interne serverfout bij terugbetaling.' }), { status: 500 });
    }
};
