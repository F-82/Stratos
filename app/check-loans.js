
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLoans() {
    // Login first to bypass RLS (if policies require auth)
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'admin@stratos.lk',
        password: 'password123' // Default password from seed
    });

    if (loginError) {
        console.error("Login failed:", loginError.message);
        // Try alternate password or exit
        return;
    }

    console.log("Logged in as:", session.user.email);

    // Find Saman (fuzzy)
    const { data: borrowers } = await supabase
        .from('borrowers')
        .select('id, full_name')
        .ilike('full_name', '%Saman%');

    if (!borrowers || borrowers.length === 0) {
        console.log("No borrower found matching 'Saman'");
        return;
    }

    console.log("Found Borrowers:", borrowers);

    for (const b of borrowers) {
        const { data: loans } = await supabase
            .from('loans')
            .select('id, status, created_at, principal_amount')
            .eq('borrower_id', b.id)
            .eq('status', 'active');

        if (loans.length > 1) {
            console.log(`DUPLICATE ACTIVE LOANS for ${b.full_name}:`, JSON.stringify(loans, null, 2));
        } else {
            console.log(`Borrower ${b.full_name} has ${loans.length} active loans.`);
        }
    }
}

checkLoans();
