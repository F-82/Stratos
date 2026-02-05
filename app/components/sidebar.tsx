"use client";

import { LayoutDashboard, Users, CreditCard, PieChart, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Users, label: "Borrowers", href: "/dashboard/borrowers" },
    { icon: CreditCard, label: "Loans", href: "/dashboard/loans" },
    { icon: PieChart, label: "Reports", href: "/dashboard/reports" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="hidden h-screen w-64 flex-col bg-card border-r border-border/50 md:flex shadow-sm">
            {/* Logo Section */}
            <div className="flex h-20 items-center px-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan to-blue flex items-center justify-center">
                        <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 100 100"
                        >
                            <line x1="20" y1="50" x2="80" y2="50" stroke="white" strokeWidth="10" strokeLinecap="round"/>
                            <line x1="50" y1="20" x2="50" y2="80" stroke="white" strokeWidth="10" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Stratos</h1>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 space-y-1 px-4 py-6">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-smooth",
                                isActive
                                    ? "bg-gradient-to-r from-cyan/20 to-blue/20 text-blue-deep shadow-soft border border-cyan/20"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground hover-scale"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 transition-colors",
                                isActive ? "text-blue" : "text-muted-foreground"
                            )} />
                            {item.label}
                        </Link>
                    );
                })}
            </div>

            {/* Sign Out Button */}
            <div className="border-t border-border/50 p-4">
                <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-smooth hover-scale"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
