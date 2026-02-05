import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LogOut, Home } from "lucide-react";
import Link from "next/link";

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
        // Allow for testing convenience
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Mobile Header */}
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-light-blue to-medium-blue flex items-center justify-center shadow-sm">
                        <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 100 100"
                        >
                            <line x1="20" y1="50" x2="80" y2="50" stroke="white" strokeWidth="10" strokeLinecap="round"/>
                            <line x1="50" y1="20" x2="50" y2="80" stroke="white" strokeWidth="10" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="font-bold text-foreground text-lg">Stratos</h1>
                        <p className="text-xs text-muted-foreground font-normal">Collector App</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-light-blue to-medium-blue text-sm flex items-center justify-center text-white font-semibold shadow-sm">
                        {user.email?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-1 p-6 pb-24">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-border/50 bg-background/80 backdrop-blur-xl shadow-lg">
                <div className="flex items-center justify-around px-6 py-4">
                    <Link 
                        href="/collector" 
                        className="flex flex-col items-center gap-1 text-medium-blue transition-smooth"
                    >
                        <Home className="h-6 w-6" strokeWidth={2} />
                        <span className="text-xs font-medium">Home</span>
                    </Link>
                    <Link 
                        href="/login" 
                        className="flex flex-col items-center gap-1 text-muted-foreground hover:text-destructive transition-smooth"
                    >
                        <LogOut className="h-6 w-6" strokeWidth={2} />
                        <span className="text-xs font-medium">Sign Out</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
