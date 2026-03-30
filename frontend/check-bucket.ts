import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// read .env
const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
});

const supabaseUrl = env.PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkBucket() {
    const { data, error } = await supabaseAdmin.storage.listBuckets();
    if (error) {
        console.error("Error listing buckets:", error);
    } else {
        console.log("Buckets:", data.map(b => b.name));
        const exists = data.some(b => b.name === 'product-images');
        if (!exists) {
            console.log("Bucket 'product-images' does NOT exist. Creating it...");
            const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket('product-images', { public: true });
            if (createError) {
                console.error("Error creating bucket:", createError);
            } else {
                console.log("Bucket created:", newBucket);
            }
        } else {
            console.log("Bucket 'product-images' already exists.");
        }
    }
}

checkBucket();
