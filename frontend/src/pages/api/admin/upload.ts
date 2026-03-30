import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export interface UploadResponse {
    success: boolean;
    imageUrl?: string;
    error?: string;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return new Response(JSON.stringify({ success: false, error: 'No image file provided' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 1. File Type Validation
        if (!file.type.startsWith('image/')) {
            return new Response(JSON.stringify({ success: false, error: 'File must be an image (e.g., .jpg, .png, .webp)' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. File Size Validation (Strict 5MB limit)
        const MAX_SIZE_BYTES = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE_BYTES) {
            return new Response(JSON.stringify({ success: false, error: 'File size exceeds the strict 5MB limit' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 3. Sanitization & Name Generation
        const originalName = file.name;
        const extensionMatch = originalName.match(/\.([^.]+)$/);
        // Default to png if no extension, though type checking passed so it's likely an image
        const extension = extensionMatch ? extensionMatch[1].toLowerCase().replace(/[^a-z0-9]/g, '') : 'png';
        const safeFilename = `${crypto.randomUUID()}.${extension}`;

        // 4. Buffer Conversion
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // 5. Secure Supabase Upload
        const { error: uploadError } = await supabaseAdmin.storage
            .from('product-images')
            .upload(safeFilename, buffer, {
                contentType: file.type,
                upsert: false // Never overwrite existing unique UUIDs
            });

        if (uploadError) {
            console.error('Supabase Storage Upload Error:', uploadError);
            throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        // 6. URL Retrieval
        const { data: publicUrlData } = supabaseAdmin.storage
            .from('product-images')
            .getPublicUrl(safeFilename);

        return new Response(JSON.stringify({ 
            success: true, 
            imageUrl: publicUrlData.publicUrl 
        } as UploadResponse), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Server Image Upload Error:', error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: error.message || 'Internal Server Error during image upload' 
        } as UploadResponse), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
