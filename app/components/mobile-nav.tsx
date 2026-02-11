"use client";

import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LayoutDashboard, Users, CreditCard, PieChart, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Users, label: "Borrowers", href: "/dashboard/borrowers" },
    { icon: CreditCard, label: "Loans", href: "/dashboard/loans" },
    { icon: PieChart, label: "Reports", href: "/dashboard/reports" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [open, setOpen] = useState(false);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        setOpen(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] list-none p-0 flex flex-col h-full bg-card border-r border-border/50">
                <SheetHeader className="h-20 flex items-center justify-center border-b border-border/50 px-6">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SheetDescription className="sr-only">Main menu for mobile navigation</SheetDescription>
                    <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-light-blue to-medium-blue flex items-center justify-center shadow-sm">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 100 100"
                            >
                                <line x1="20" y1="50" x2="80" y2="50" stroke="white" strokeWidth="10" strokeLinecap="round" />
                                <line x1="50" y1="20" x2="50" y2="80" stroke="white" strokeWidth="10" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">Stratos</h1>
                    </div>
                </SheetHeader>

                <div className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-smooth",
                                    isActive
                                        ? "bg-gradient-to-r from-light-blue/20 to-medium-blue/20 text-medium-blue shadow-soft border border-light-blue/20"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground hover-scale"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 transition-colors",
                                    isActive ? "text-medium-blue" : "text-muted-foreground"
                                )} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="border-t border-border/50 p-4 mt-auto">
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-smooth hover-scale"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
