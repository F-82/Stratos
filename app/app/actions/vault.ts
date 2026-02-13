"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Initialize Admin Client
const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// Helper to check admin
async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check role in metadata
    if (user.user_metadata?.role !== 'admin') {
        // Fallback to profile
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') throw new Error("Unauthorized: Admin access required");
    }
}

export async function resetCollectors() {
    try {
        await checkAdmin();

        // 1. Get all collectors
        const { data: collectors, error: fetchError } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("role", "collector");

        if (fetchError) throw fetchError;

        if (!collectors || collectors.length === 0) {
            return { success: true, message: "No collectors found to delete." };
        }

        const collectorIds = collectors.map(c => c.id);

        // 2. Delete from auth.users (cascades to profiles usually, but we handle explicit).
        // Deleting user from auth.users is the main thing.
        // It should cascade to profiles if set up, but let's be sure.

        const errors = [];
        for (const id of collectorIds) {
            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id);
            if (deleteError) {
                console.error(`Failed to delete user ${id}:`, deleteError);
                errors.push(`User ${id}: ${deleteError.message}`);
            }
        }

        if (errors.length > 0) {
            return { success: false, error: `Failed: ${errors[0]}`, details: errors };
        }

        revalidatePath("/dashboard/collectors");
        return { success: true, message: `Successfully deleted ${collectorIds.length} collectors.` };

    } catch (error: any) {
        console.error("Reset Collectors Error:", error);
        return { error: error.message };
    }
}

export async function resetBorrowers() {
    try {
        await checkAdmin();

        // Delete all borrowers
        // Using .gt to filter all valid UUIDs is a safe way to 'delete all'
        const { error: deleteError } = await supabaseAdmin
            .from("borrowers")
            .delete()
            .gt("id", "00000000-0000-0000-0000-000000000000");

        if (deleteError) throw deleteError;

        revalidatePath("/dashboard/borrowers");
        revalidatePath("/dashboard");
        return { success: true, message: "All borrowers deleted." };

    } catch (error: any) {
        console.error("Reset Borrowers Error:", error);
        return { error: error.message };
    }
}

export async function resetLoans() {
    try {
        await checkAdmin();

        // 1. Delete Payments first (integrity)
        const { error: paymentsError } = await supabaseAdmin
            .from("payments")
            .delete()
            .gt("id", "00000000-0000-0000-0000-000000000000");

        if (paymentsError) throw paymentsError;

        // 2. Delete Loans
        const { error: loansError } = await supabaseAdmin
            .from("loans")
            .delete()
            .gt("id", "00000000-0000-0000-0000-000000000000");

        if (loansError) throw loansError;

        revalidatePath("/dashboard/loans");
        revalidatePath("/dashboard");
        return { success: true, message: "All loans and payments reset." };

    } catch (error: any) {
        console.error("Reset Loans Error:", error);
        return { error: error.message };
    }
}
