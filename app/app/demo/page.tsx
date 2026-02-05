"use client";

import { useState, useEffect } from "react";
import { MotionContainer } from "@/components/motion-container";
import { KPICards } from "@/components/kpi-cards";
import { CollectionsTrend } from "@/components/collections-trend";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function DemoPage() {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [metrics] = useState({
        totalCollected: 2450000,
        totalOutstanding: 1850000,
        activeLoans: 127,
        collectedToday: 85000
    });

    const todayDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login"); // Secure the page
            } else {
                setUser(user);
            }
            setLoading(false);
        }
        checkUser();
    }, [router, supabase]);

    if (loading) return null; // Or a loading spinner

    return (
        <div className="flex h-screen bg-background">
            {/* Shared Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Shared Header */}
                <Header user={user} />

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto bg-secondary/30 p-6">
                    <MotionContainer className="min-h-screen">
                        {/* Page Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-4xl font-bold text-foreground tracking-tight">Loan Management (Demo)</h1>
                                <p className="text-sm text-muted-foreground mt-2 font-normal">{todayDate}</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Row 1: KPI Cards */}
                            <KPICards metrics={metrics} />

                            {/* Row 2: Main Graph + Side Stats */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Collections Trend Chart */}
                                <div className="lg:col-span-2">
                                    <CollectionsTrend />
                                </div>

                                {/* Side Statistics */}
                                <div className="space-y-6">
                                    {/* On-Time Rate Card */}
                                    <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft hover-lift transition-smooth">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
                                            On-Time Payment Rate
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-end justify-between">
                                                <span className="text-5xl font-bold text-foreground">92%</span>
                                                <span className="text-sm text-muted-foreground">8% missed</span>
                                            </div>
                                            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden shadow-inner">
                                                <div
                                                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full shadow-sm transition-all"
                                                    style={{ width: '92%' }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Based on {metrics.activeLoans} active loans
                                            </p>
                                        </div>
                                    </div>

                                    {/* Projected Collections Card */}
                                    <div className="bg-gradient-to-br from-light-blue/10 to-medium-blue/10 rounded-2xl border border-light-blue/20 p-6 shadow-soft hover-lift transition-smooth">
                                        <h3 className="text-sm font-medium text-deep-blue mb-6 uppercase tracking-wider">
                                            Expected Next Month
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="text-4xl font-bold text-foreground">Rs. 520,000</div>
                                            <p className="text-sm text-muted-foreground">Projected collections</p>
                                            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium mt-4">
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                                    <polyline points="17 6 23 6 23 12" />
                                                </svg>
                                                +8.5% from last month
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </MotionContainer>
                </main>
            </div>
        </div>
    );
}
