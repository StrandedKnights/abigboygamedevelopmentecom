import type { APIRoute } from 'astro';
import { PrismaClient } from '@prisma/client';
import { PLATFORMS, CONDITIONS } from '../../../config/taxonomy';

const prisma = new PrismaClient();

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        
        const { title, platform, priceInCents, stock, condition, imageUrl, isWeekdeal } = body;

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

        // 4. Database Creation (using any to bypass stale locally-locked types)
        const product = await (prisma.product as any).create({
            data: {
                title,
                platform,
                priceInCents,
                stock,
                condition,
                imageUrl,
                isWeekdeal: !!isWeekdeal,
                isLegacy: false
            }
        });

        return new Response(JSON.stringify(product), { status: 201 });

    } catch (error: any) {
        console.error("API Product Creation Error:", error);
        return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
    }
};
