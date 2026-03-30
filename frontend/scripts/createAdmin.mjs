import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env loading to avoid dependency on dotenv for a single script
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
    envContent
        .split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
            const [k, ...v] = line.split('=');
            return [k.trim(), v.join('=').trim().replace(/^"(.*)"$/, '$1')];
        })
);

const supabaseUrl = env.PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing Supabase URL or Service Role Key in .env");
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.error("❌ Usage: node createAdmin.mjs <email> <password>");
        process.exit(1);
    }

    try {
        console.log(`⏳ Creating admin account for ${email}...`);
        
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (error) {
            throw error;
        }

        console.log(`✅ Success! Admin account created. User ID: ${data.user.id}`);
    } catch (err) {
        console.error("❌ Failed to create admin:", err.message || err);
    }
}

createAdmin();
