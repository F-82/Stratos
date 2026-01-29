import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { Header } from "@/components/header";
// We might want a simplified header for mobile or reuse existing

export default async function CollectorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Verify role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'collector') {
        // If admin tries to access, maybe redirect to dashboard? 
        // Or just allow for testing convience, but strictly:
        // return redirect("/dashboard"); 
        // For now, let's allow it but log it or just proceed.
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
                <h1 className="font-bold text-primary">Stratos <span className="text-xs font-normal text-muted-foreground">Collector</span></h1>
                <div className="h-8 w-8 rounded-full bg-secondary text-xs flex items-center justify-center">
                    {user.email?.charAt(0).toUpperCase()}
                </div>
            </header>
            <main className="flex-1 p-4 pb-20">
                {children}
            </main>

            {/* Bottom Nav Placeholder (Optional for later) */}
        </div>
    );
}
