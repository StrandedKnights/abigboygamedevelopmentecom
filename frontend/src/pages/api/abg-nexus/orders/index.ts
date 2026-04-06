import type { APIRoute } from 'astro';
import prisma from '../../../../lib/prisma';

export const GET: APIRoute = async () => {
    try {
        // Find all orders, including their nested products
        const orders = await (prisma.order as any).findMany({
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Wrap the payload in our expected API Envelope
        return new Response(JSON.stringify({ status: 'success', data: orders }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Fetch Orders Error:', error);
        return new Response(JSON.stringify({ status: 'error', message: 'Er is iets misgegaan bij het laden van de bestellingen.' }), { 
            status: 500,
             headers: { 'Content-Type': 'application/json' }
        });
    }
};
