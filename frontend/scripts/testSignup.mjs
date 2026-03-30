import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

const supabaseUrl = env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function signup() {
    const email = "admin@abigboysgame.nl";
    const password = "Password123!";

    console.log(`⏳ Attempting public signup for ${email}...`);
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error("❌ Signup failed (maybe disabled?):", error.message);
    } else {
        console.log("✅ Success! Test account signed up. Please confirm the email in Supabase dashboard or check if it's auto-confirmed.");
    }
}

signup();
