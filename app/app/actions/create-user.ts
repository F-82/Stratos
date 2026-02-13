"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData) {
    const supabase = await createClient();

    // 1. Verify the current user is an admin
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized: Not logged in" };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return { error: "Unauthorized: Insufficient permissions" };
    }

    // 2. Initialize Admin Client
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

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const role = "collector"; // Hardcoded for this action, or dynamic if needed

    if (!email || !password || !fullName) {
        return { error: "Missing required fields" };
    }

    try {
        // 3. Create User in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                role: role,
            },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Failed to create user");

        // 4. Create Profile Entry
        // Ensure profiles table exists and has these columns. 
        // Typically Supabase creates a profile on trigger, but if not we do it manually.
        // Assuming we do it manually or update the existing one if trigger exists.
        // Let's try upserting to be safe/compliant with potential triggers.

        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .upsert({
                id: authData.user.id,
                role: role,
                full_name: fullName,
                email: email,
                phone: phone
            });

        if (profileError) {
            // Rollback user creation if profile fails? 
            // Ideally yes, but for now let's just throw.
            // Consider deleting the auth user if profile creation fails strictly.
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            throw profileError;
        }

        revalidatePath("/dashboard/settings"); // Or /dashboard/collectors
        revalidatePath("/dashboard/collectors");

        return { success: true, message: "Collector created successfully" };

    } catch (error: any) {
        console.error("Create User Error:", error);
        return { error: error.message };
    }
}
