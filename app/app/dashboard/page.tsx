import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // Fetch user profile to know if admin or collector
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
            <p className="mt-4">
                Welcome back, <span className="font-semibold">{profile?.full_name || user.email}</span>
            </p>
            <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Overview Panel</h2>
                <p className="text-muted-foreground mt-2">
                    Financial insights will appear here.
                </p>
                <div className="mt-4 p-4 bg-secondary rounded text-sm font-mono">
                    Role: {profile?.role || "Unknown"}
                </div>
            </div>
        </div>
    );
}
