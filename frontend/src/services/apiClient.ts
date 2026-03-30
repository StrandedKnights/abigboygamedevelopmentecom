/**
 * Centralized API client for A Big Boy's Game.
 * Single source of truth for all frontend-to-backend communication.
 */

// --- Types ---
export interface Product {
    id: string;
    title: string;
    platform: string;
    priceInCents: number;
    stock: number;
    condition: string;
    imageUrl: string;
    isLegacy: boolean;
    isWeekdeal: boolean;
    discountPriceInCents?: number | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface OrderItem {
    id: string;
    quantity: number;
    priceAtPurchaseInCents: number;
    productId: string;
    product?: Product;
}

export interface Order {
    id: string;
    customerEmail: string;
    customerName: string;
    totalAmountInCents: number;
    status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
    trackingCode?: string | null;
    createdAt: string;
    items?: OrderItem[];
}

export interface AuthResponse {
    token: string;
    user: {
        email: string;
    };
}

// --- Configuration ---
const API_BASE_URL = (import.meta as any).env.PUBLIC_API_URL || '/api';

// --- Error Handling ---
export class APIError extends Error {
    constructor(public message: string, public status: number, public data?: any) {
        super(message);
        this.name = 'APIError';
    }
}

// --- Core Fetcher ---
async function fetcher<T>(endpoint: string, options: Omit<RequestInit, 'body'> & { body?: any } = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Headers
    const headers = new Headers(options.headers);
    
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    if (!isFormData) {
        headers.set('Content-Type', 'application/json');
    }

    // Auth Token (Client-side only)
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('adminToken');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    // Body handling
    const fetchOptions: RequestInit = { ...options };
    if (isFormData) {
        fetchOptions.body = options.body;
    } else if (options.body && typeof options.body === 'object') {
        fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, { ...fetchOptions, headers });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = { message: 'An unknown error occurred' };
        }
        throw new APIError(errorData.message || response.statusText, response.status, errorData);
    }

    const result = await response.json();
    
    // Auto-unwrap the standard envelope if it exists
    if (result && typeof result === 'object' && result.status === 'success' && 'data' in result) {
        return result.data as T;
    }
    
    return result as T;
}

// --- API Modules ---

export const ProductsAPI = {
    /** Fetches the newest 6 items for the homepage slider. */
    getLatestAdditions: () => 
        fetcher<Product[]>('/products?limit=6&sort=newest'),

    /** Fetches active weekdeals for the homepage banner. */
    getWeekdeals: () => 
        fetcher<Product[]>('/products?isWeekdeal=true'),

    /** Fetches filtered/paginated products for the main shop page. */
    getShopProducts: (params: Record<string, string | number | boolean>) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                query.append(key, String(value));
            }
        });
        return fetcher<{ products: Product[], pagination: { totalCount: number, totalPages: number, currentPage: number, limit: number } }>(`/products?${query.toString()}`);
    },

    /** Fetches a single product for the PDP. */
    getProductById: (id: string) => 
        fetcher<Product>(`/products/${id}`)
};

export const CheckoutAPI = {
    /** POSTs to initiate the Mollie payment and database soft-lock. */
    createOrder: (cartItems: Array<{ id: string, quantity: number }>, customerData: any, promoCode?: string) =>
        fetcher<{ paymentUrl: string, orderId: string }>('/checkout', {
            method: 'POST',
            body: { cartItems, customerData, promoCode }
        })
};

export const AdminAPI = {
    /** POSTs to receive the JWT token. */
    login: (password: string) => 
        fetcher<AuthResponse>('/admin/login', {
            method: 'POST',
            body: { password }
        }),

    /** GETs all orders for the dashboard. */
    getOrders: () => 
        fetcher<Order[]>('/admin/orders'),

    /** PATCHes an order's status or tracking. */
    updateOrderStatus: (orderId: string, status: string, trackingCode?: string) =>
        fetcher<Order>(`/admin/orders/${orderId}`, {
            method: 'PATCH',
            body: { status, trackingCode }
        }),

    /** POSTs a new retro game to the inventory. */
    createProduct: (productData: Partial<Product>) =>
        fetcher<Product>('/admin/products', {
            method: 'POST',
            body: productData
        }),

    /** POSTs an image upload to the secure server endpoint. */
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        return fetcher<{ success: boolean; imageUrl?: string; error?: string }>('/admin/upload', {
            method: 'POST',
            body: formData
        });
    }
};
