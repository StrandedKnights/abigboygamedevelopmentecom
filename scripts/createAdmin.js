/**
 * Admin Creation Utility
 * Run this script locally using Node to generate your first Master Admin account.
 * 
 * Usage from terminal:
 * node scripts/createAdmin.js YOUR_EMAIL YOUR_PASSWORD
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment from frontend/.env
dotenv.config({ path: path.resolve(process.cwd(), 'frontend', '.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST HAVE SERVICE ROLE for bypassing email confirm

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing Supabase URL or Service Role Key in .env");
    console.log("Make sure you run this from the root of the project where frontend/.env is accessible.");
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.error("❌ Usage: node createAdmin.js <email> <password>");
        process.exit(1);
    }

    try {
        console.log(`⏳ Creating admin account for ${email}...`);
        
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true // important so you can login immediately
        });

        if (error) {
            throw error;
        }

        console.log(`✅ Success! Admin account created. User ID: ${data.user.id}`);
        console.log(`🔐 You can now log into '/admin/login' with these credentials.`);
    } catch (err) {
        console.error("❌ Failed to create admin:", err.message || err);
    }
}

createAdmin();
