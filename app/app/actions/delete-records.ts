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
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Unauthorized: Not logged in" };
        const { data: profile } = await supabase
            .from("profiles").select("role").eq("id", user.id).single();
        if (profile?.role !== "admin") return { error: "Unauthorized: Insufficient permissions" };
        return { ok: true };
    } catch {
        return { error: "Auth check failed" };
    }
}

// Safe delete helper – never throws, returns true/false
async function safeDelete(admin: ReturnType<typeof getAdminClient>, table: string, column: string, value: string | string[]) {
    try {
        const query = Array.isArray(value)
            ? admin.from(table).delete().in(column, value)
            : admin.from(table).delete().eq(column, value);
        await query;
    } catch {
        // Table might not exist or other non-critical error – skip silently
    }
}

// ──────────────────────────────────────────────
// Delete Loan (+ its payments + daily_tasks)
// ──────────────────────────────────────────────
export async function deleteLoan(loanId: string) {
    try {
        const auth = await verifyAdmin();
        if (auth.error) return { error: auth.error };

        const admin = getAdminClient();

        // Delete dependent records first (safe — won't throw even if table missing)
        await safeDelete(admin, "daily_tasks", "loan_id", loanId);
        await safeDelete(admin, "payments", "loan_id", loanId);

        // Now delete the loan itself
        const { error } = await admin.from("loans").delete().eq("id", loanId);
        if (error) return { error: error.message };

        revalidatePath("/dashboard/loans");
        return { success: true };
    } catch (err: any) {
        console.error("deleteLoan error:", err);
        return { error: err.message ?? "An unexpected error occurred" };
    }
}

// ──────────────────────────────────────────────
// Delete Borrower (+ their loans + payments + daily_tasks)
// ──────────────────────────────────────────────
export async function deleteBorrower(borrowerId: string) {
    try {
        const auth = await verifyAdmin();
        if (auth.error) return { error: auth.error };

        const admin = getAdminClient();

        // Get all loan IDs for this borrower
        const { data: loans, error: loansQueryError } = await admin
            .from("loans").select("id").eq("borrower_id", borrowerId);
        if (loansQueryError) return { error: loansQueryError.message };

        const loanIds = loans?.map(l => l.id) ?? [];

        if (loanIds.length > 0) {
            await safeDelete(admin, "daily_tasks", "loan_id", loanIds);
            await safeDelete(admin, "payments", "loan_id", loanIds);
            const { error: loansDeleteError } = await admin.from("loans").delete().in("id", loanIds);
            if (loansDeleteError) return { error: "Failed to delete loans: " + loansDeleteError.message };
        }

        const { error } = await admin.from("borrowers").delete().eq("id", borrowerId);
        if (error) return { error: error.message };

        revalidatePath("/dashboard/borrowers");
        return { success: true };
    } catch (err: any) {
        console.error("deleteBorrower error:", err);
        return { error: err.message ?? "An unexpected error occurred" };
    }
}

// ──────────────────────────────────────────────
// Delete Collector (profile + auth user)
// ──────────────────────────────────────────────
export async function deleteCollector(collectorId: string) {
    try {
        const auth = await verifyAdmin();
        if (auth.error) return { error: auth.error };

        const admin = getAdminClient();

        // Delete the profile row first (best effort)
        await safeDelete(admin, "profiles", "id", collectorId);

        // Delete the Supabase Auth user (the real source of truth)
        const { error: authError } = await admin.auth.admin.deleteUser(collectorId);
        if (authError) return { error: "Failed to delete collector: " + authError.message };

        revalidatePath("/dashboard/collectors");
        return { success: true };
    } catch (err: any) {
        console.error("deleteCollector error:", err);
        return { error: err.message ?? "An unexpected error occurred" };
    }
}
