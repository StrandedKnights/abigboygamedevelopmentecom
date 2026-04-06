import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';
import { PLATFORMS, CONDITIONS } from '../../../config/taxonomy';

export const POST: APIRoute = async ({ request }) => {
    try {
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

        // 4. Database Creation
        const product = await (prisma.product as any).create({
            data: {
                title,
                platform,
                priceInCents,
                purchasePriceInCents: purchasePriceInCents ?? null,
                stock,
                condition,
                imageUrl,
                isWeekdeal: !!isWeekdeal,
                taxScheme: taxScheme || "MARGIN",
                isLegacy: false
            }
        });

        return new Response(JSON.stringify(product), { status: 201 });

    } catch (error: any) {
        console.error("API Product Creation Error:", error);
        return new Response(JSON.stringify({ error: "Er is iets misgegaan bij het aanmaken van het product." }), { status: 500 });
    }
};
