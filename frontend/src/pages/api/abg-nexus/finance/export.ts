import type { APIRoute } from 'astro';
import prisma from '../../../../lib/prisma';

export const GET: APIRoute = async () => {
    try {
        // Fetch products sold using MARGIN scheme (or all paid orders)
        // For accurate finance, we'll fetch recently sold items with MARGIN tax scheme
        const soldItems = await prisma.orderItem.findMany({
            where: {
                order: { status: { in: ['PAID', 'SHIPPED'] } },
                taxScheme: 'MARGIN'
            },
            include: {
                order: true,
                product: true
            },
            orderBy: { order: { createdAt: 'desc' } }
        });

        // Construct CSV
        const headers = [
            "Order ID",
            "Order Datum",
            "Product ID",
            "Product Titel",
            "Inkoopprijs (€)",
            "Verkoopprijs (€)",
            "Winstmarge (€)",
            "BTW 21% over Marge (€)"
        ];

        const rows = soldItems.map(item => {
            const date = item.order.createdAt.toISOString().split('T')[0];
            const purchaseEur = (item.purchasePriceAtPurchaseInCents || 0) / 100;
            const sellEur = item.priceAtPurchaseInCents / 100;
            const marginEur = Math.max(0, sellEur - purchaseEur);
            const vatEur = (marginEur * 0.21) / 1.21; // Margeregeling VAT calculation

            return [
                item.orderId,
                date,
                item.productId,
                `"${item.product.title.replace(/"/g, '""')}"`,
                purchaseEur.toFixed(2),
                sellEur.toFixed(2),
                marginEur.toFixed(2),
                vatEur.toFixed(2)
            ].join(',');
        });

        const csvString = [headers.join(','), ...rows].join('\n');

        return new Response(csvString, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="margeregeling_export_${new Date().toISOString().split('T')[0]}.csv"`
            }
        });
    } catch (e: any) {
        console.error('[Finance Export Error]:', e);
        return new Response(JSON.stringify({ error: 'Er is iets misgegaan bij het genereren van de export.' }), { status: 500 });
    }
};
