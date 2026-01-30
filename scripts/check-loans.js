
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env from .env.local
dotenv.config({ path: path.resolve(__dirname, '../app/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLoans() {
    // Find Saman
    const { data: borrower } = await supabase
        .from('borrowers')
        .select('id')
        .eq('full_name', 'Saman Perera')
        .single();

    if (!borrower) {
        console.log("Saman Perera not found");
        return;
    }

    const { data: loans } = await supabase
        .from('loans')
        .select('id, status, created_at, principal_amount')
        .eq('borrower_id', borrower.id);

    console.log("Loans for Saman Perera:", loans);
}

checkLoans();
