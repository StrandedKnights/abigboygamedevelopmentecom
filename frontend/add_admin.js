const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.PUBLIC_SUPABASE_URL,
    process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function addAdmin() {
    console.log('Registering user...');
    const { data, error } = await supabase.auth.signUp({
        email: 'boy@abigboysgame.nl',
        password: 'BoyHeim123123'
    });

    if (error) {
        console.error('Error creating user:', error.message);
    } else {
        console.log('User created successfully:', data.user?.email);
        if (data.session) {
            console.log('Email confirmation is OFF, account is active.');
        } else {
            console.log('Email confirmation is ON, please check the email address for a confirmation link.');
        }
    }
}

addAdmin();
