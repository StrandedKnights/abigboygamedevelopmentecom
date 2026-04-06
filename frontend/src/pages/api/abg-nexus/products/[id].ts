import type { APIRoute } from 'astro';
import prisma from '../../../../lib/prisma';
import { PLATFORMS, CONDITIONS } from '../../../../config/taxonomy';

export const PATCH: APIRoute = async ({ request, params }) => {
    try {
        const id = params.id;
        if (!id) {
            return new Response(JSON.stringify({ error: "Product ID is missing." }), { status: 400 });
        }

        const body = await request.json();
        
        const { title, platform, priceInCents, purchasePriceInCents, stock, condition, imageUrl, isWeekdeal, taxScheme } = body;

        // 1. Mandatory Field Validation
        if (!title || !platform || !priceInCents || stock === undefined || !condition || !imageUrl) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // 2. Strict Taxonomy Validation (The Bouncer)
        if (!PLATFORMS.includes(platform as any)) {
            return new Response(JSON.stringify({ 
                error: `Invalid platform: '${platform}'. Must be one of the 30 official categories.` 
            }), { status: 400 });
        }

        if (!CONDITIONS.includes(condition as any)) {
            return new Response(JSON.stringify({ 
                error: `Invalid condition: '${condition}'.` 
            }), { status: 400 });
        }

        // 3. Numeric Validation
        if (priceInCents <= 0 || stock < 0) {
            return new Response(JSON.stringify({ error: "Price must be positive and stock cannot be negative." }), { status: 400 });
        }

        // 4. Update Database
        const product = await (prisma.product as any).update({
            where: { id },
            data: {
                title,
                platform,
                priceInCents,
                purchasePriceInCents: purchasePriceInCents ?? null,
                stock,
                condition,
                imageUrl,
                isWeekdeal: !!isWeekdeal,
                taxScheme: taxScheme || "MARGIN"
            }
        });

        return new Response(JSON.stringify(product), { status: 200 });

    } catch (error: any) {
        console.error("API Product Update Error:", error);
        return new Response(JSON.stringify({ error: "Er is iets misgegaan bij het bijwerken van het product." }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ params }) => {
    try {
        const id = params.id;
        if (!id) {
            return new Response(JSON.stringify({ error: "Product ID is missing." }), { status: 400 });
        }

        await (prisma.product as any).delete({
            where: { id }
        });

        return new Response(JSON.stringify({ success: true, message: "Product verwijderd." }), { status: 200 });

    } catch (error: any) {
        console.error("API Product Delete Error:", error);
        return new Response(JSON.stringify({ error: "Olielek! Kan product niet verwijderen. Mogelijk is het gebonden aan bestaande orders." }), { status: 500 });
    }
};
