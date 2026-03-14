"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized: Not logged in" };

    const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", user.id).single();

    if (profile?.role !== "admin") return { error: "Unauthorized: Insufficient permissions" };
    return { ok: true };
}

// ──────────────────────────────────────────────
// Delete Loan (+ its payments + daily_tasks)
// ──────────────────────────────────────────────
export async function deleteLoan(loanId: string) {
    const auth = await verifyAdmin();
    if (auth.error) return { error: auth.error };

    const admin = getAdminClient();

    // 1. Delete payments
    const { error: paymentsError } = await admin
        .from("payments")
        .delete()
        .eq("loan_id", loanId);
    if (paymentsError) console.warn("Payments delete:", paymentsError.message);

    // 2. Delete daily_tasks (table may not exist yet — ignore error)
    await admin.from("daily_tasks").delete().eq("loan_id", loanId);

    // 3. Delete loan
    const { error } = await admin.from("loans").delete().eq("id", loanId);
    if (error) return { error: "Failed to delete loan: " + error.message };

    revalidatePath("/dashboard/loans");
    return { success: true };
}

// ──────────────────────────────────────────────
// Delete Borrower (+ their loans + payments + daily_tasks)
// ──────────────────────────────────────────────
export async function deleteBorrower(borrowerId: string) {
    const auth = await verifyAdmin();
    if (auth.error) return { error: auth.error };

    const admin = getAdminClient();

    // 1. Get all loans for this borrower
    const { data: loans } = await admin
        .from("loans").select("id").eq("borrower_id", borrowerId);
    const loanIds = loans?.map(l => l.id) ?? [];

    if (loanIds.length > 0) {
        // 2. Delete payments
        await admin.from("payments").delete().in("loan_id", loanIds);
        // 3. Delete daily_tasks
        await admin.from("daily_tasks").delete().in("loan_id", loanIds);
        // 4. Delete loans
        const { error: loansError } = await admin.from("loans").delete().in("id", loanIds);
        if (loansError) return { error: "Failed to delete loans: " + loansError.message };
    }

    // 5. Delete borrower
    const { error } = await admin.from("borrowers").delete().eq("id", borrowerId);
    if (error) return { error: "Failed to delete borrower: " + error.message };

    revalidatePath("/dashboard/borrowers");
    return { success: true };
}

// ──────────────────────────────────────────────
// Delete Collector (profile + auth user)
// ──────────────────────────────────────────────
export async function deleteCollector(collectorId: string) {
    const auth = await verifyAdmin();
    if (auth.error) return { error: auth.error };

    const admin = getAdminClient();

    // 1. Delete the profile row
    const { error: profileError } = await admin
        .from("profiles").delete().eq("id", collectorId);
    if (profileError) console.warn("Profile delete:", profileError.message);

    // 2. Delete the actual Supabase Auth user (this is the real source of truth)
    const { error: authError } = await admin.auth.admin.deleteUser(collectorId);
    if (authError) return { error: "Failed to delete collector: " + authError.message };

    revalidatePath("/dashboard/collectors");
    return { success: true };
}
