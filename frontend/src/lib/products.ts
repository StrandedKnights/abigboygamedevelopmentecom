import prisma from './prisma';

export async function getProducts(params: {
    search?: string;
    platforms?: string[];
    conditions?: string[];
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
}) {
    const {
        search = '',
        platforms = [],
        conditions = [],
        minPrice = 0,
        maxPrice = 1000000,
        inStockOnly = false,
        sort = 'newest',
        page = 1,
        limit = 24
    } = params;

    const skip = (page - 1) * limit;

    // Build Where Clause
    const where: any = {
        AND: [
            {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { platform: { contains: search, mode: 'insensitive' } }
                ]
            },
            { priceInCents: { gte: minPrice, lte: maxPrice } }
        ]
    };

    if (platforms.length > 0) {
        where.AND.push({ platform: { in: platforms } });
    }

    if (conditions.length > 0) {
        where.AND.push({ condition: { in: conditions } });
    }

    if (inStockOnly) {
        where.AND.push({ stock: { gt: 0 } });
    }

    // Build Order Logic
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { priceInCents: 'asc' };
    if (sort === 'price_desc') orderBy = { priceInCents: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };

    const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy,
            skip,
            take: limit
        }),
        prisma.product.count({ where })
    ]);

    return {
        products,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit
        }
    };
}

export async function getProductById(id: string) {
    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product) return null;

    // Check availability
    const now = new Date();
    const isAvailable = product.stock > 0 && (!product.reservedUntil || new Date(product.reservedUntil) < now);

    return {
        ...product,
        isAvailable
    };
}
