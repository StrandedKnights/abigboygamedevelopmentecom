import type { APIRoute } from 'astro';
import prisma from '../../../../lib/prisma';

/**
 * Stub Email Function for future integration.
 * In production this will bind to SendGrid / Resend based on USER choice.
 */
async function sendShippedEmail(orderId: string, email: string, trackingCode: string) {
    console.log(`[EMAIL STUB]: Triggering Shipped Email to ${email} for order ${orderId}. Tracking URL: https://tracking.postnl.nl/track-and-trace/${trackingCode}`);
    // In actual implementation, we might call Resend API here.
}

async function logOrderEvent(prismaClient: any, orderId: string, type: string, details: string) {
    await prismaClient.orderEvent.create({
        data: {
            orderId,
            type,
            details
        }
    });
}

export const PATCH: APIRoute = async ({ request, params }) => {
    try {
        const { id } = params;
        if (!id) throw new Error("Missing Order ID");

        const body = await request.json();
        const { status, trackingCode } = body;

        // Fetch old order with items to handle RMA
        const oldOrder = await prisma.order.findUnique({ 
            where: { id },
            include: { items: true }
        });

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status,
                trackingCode: trackingCode || null
            }
        });

        // Did status change?
        if (oldOrder && oldOrder.status !== status) {
            await logOrderEvent(prisma, id, "STATUS_CHANGE", `Status changed from ${oldOrder.status} to ${status}`);

            // Email trigger for shipping
            if (status === 'SHIPPED' && trackingCode) {
                await sendShippedEmail(id, updatedOrder.customerEmail, trackingCode);
                await logOrderEvent(prisma, id, "EMAIL_SENT", `Verzendbevestiging verzonden met Track & Trace: ${trackingCode}`);
            }

            // RMA Restock Flow
            if (status === 'CANCELLED' || status === 'REFUNDED') {
                for (const item of oldOrder.items) {
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    });
                }
                await logOrderEvent(prisma, id, "RMA_RESTOCK", `Geautomatiseerde RMA Restock uitgevoerd: voorraad geretourneerd.`);
            }
        }

        return new Response(JSON.stringify({ status: 'success', data: updatedOrder }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Update Order Error:', error);
        return new Response(JSON.stringify({ status: 'error', message: 'Er is iets misgegaan bij het bijwerken van de bestelling.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
