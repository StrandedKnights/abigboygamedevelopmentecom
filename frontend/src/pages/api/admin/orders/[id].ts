import type { APIRoute } from 'astro';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Stub Email Function for future integration.
 * In production this will bind to SendGrid / Resend based on USER choice.
 */
async function sendShippedEmail(orderId: string, email: string, trackingCode: string) {
    console.log(`[EMAIL STUB]: Triggering Shipped Email to ${email} for order ${orderId}. Tracking URL: https://tracking.postnl.nl/track-and-trace/${trackingCode}`);
    // Await sendgrid.send(...) 
}

export const PATCH: APIRoute = async ({ request, params }) => {
    try {
        const { id } = params;
        if (!id) throw new Error("Missing Order ID");

        const body = await request.json();
        const { status, trackingCode } = body;

        // Optionally fetch old order to compare status if needed to gate email trigger exactly once
        const oldOrder = await (prisma.order as any).findUnique({ where: { id } });

        const updatedOrder = await (prisma.order as any).update({
            where: { id },
            data: {
                status,
                trackingCode: trackingCode || null
            }
        });

        // Fire Email if transitions into SHIPPED with a valid code
        if (oldOrder && oldOrder.status !== 'SHIPPED' && status === 'SHIPPED' && trackingCode) {
            await sendShippedEmail(id, updatedOrder.customerEmail, trackingCode);
        }

        return new Response(JSON.stringify({ status: 'success', data: updatedOrder }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Update Order Error:', error);
        return new Response(JSON.stringify({ status: 'error', message: error.message || 'Error updating order' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
