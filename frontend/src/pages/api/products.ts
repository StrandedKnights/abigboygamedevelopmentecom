import type { APIRoute } from 'astro';
import { getProducts } from '../../lib/products';

export const GET: APIRoute = async ({ url }) => {
    try {
        const search = url.searchParams.get('search') || '';
        const platforms = url.searchParams.get('platforms')?.split(',').filter(Boolean) || [];
        const conditions = url.searchParams.get('conditions')?.split(',').filter(Boolean) || [];
        const minPrice = parseInt(url.searchParams.get('minPrice') || '0');
        const maxPrice = parseInt(url.searchParams.get('maxPrice') || '1000000');
        const inStockOnly = url.searchParams.get('inStockOnly') === 'true';
        const sort = url.searchParams.get('sort') || 'newest';
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '24');

        const result = await getProducts({
            search,
            platforms,
            conditions,
            minPrice,
            maxPrice,
            inStockOnly,
            sort,
            page,
            limit
        });

        return new Response(JSON.stringify({
            status: 'success',
            data: result
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({
            status: 'error',
            message: error.message || 'Internal server error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
