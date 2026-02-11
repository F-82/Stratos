"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { MotionContainer } from "@/components/motion-container";
import { KPICards } from "@/components/kpi-cards";
import { CollectionsTrend } from "@/components/collections-trend";
import { DashboardSkeleton } from "@/components/skeletons";

export default function DashboardPage() {
    const [metrics, setMetrics] = useState({
        totalCollected: 0,
        totalOutstanding: 0,
        activeLoans: 0,
        collectedToday: 0
    });
    const supabase = createClient();

    useEffect(() => {
        async function fetchMetrics() {
            // 1. Total Collected
            const { data: payments } = await supabase.from("payments").select("amount, created_at");
            const totalCollected = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

            // 2. Collected Today
            const todayStr = new Date().toISOString().split('T')[0];
            const collectedToday = payments
                ?.filter(p => p.created_at.startsWith(todayStr))
                .reduce((sum, p) => sum + p.amount, 0) || 0;

            // 3. Active Loans
            const { count: activeLoans } = await supabase
                .from("loans")
                .select("*", { count: 'exact', head: true })
                .eq("status", "active");

            // 4. Total Outstanding
            const { data: loans } = await supabase
                .from("loans")
                .select("principal_amount")
                .eq("status", "active");

            const totalPrincipalActive = loans?.reduce((sum, l) => sum + l.principal_amount, 0) || 0;

            setMetrics({
                totalCollected,
                totalOutstanding: totalPrincipalActive,
                activeLoans: activeLoans || 0,
                collectedToday
            });
        }
        fetchMetrics();
    }, []);

    const todayDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    if (metrics.totalCollected === 0 && metrics.activeLoans === 0 && metrics.totalOutstanding === 0) {
        return (
            <MotionContainer className="min-h-screen">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground tracking-tight">Loan Management</h1>
                        <p className="text-sm text-muted-foreground mt-2 font-normal">{todayDate}</p>
                    </div>
                </div>
                <DashboardSkeleton />
            </MotionContainer>
        );
    }

    // We need to add loading state to component

    return (
        <MotionContainer className="min-h-screen">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-foreground tracking-tight">Loan Management</h1>
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
                        <div className="bg-gradient-to-br from-medium-blue/10 to-light-blue/10 rounded-2xl border border-medium-blue/20 p-6 shadow-soft hover-lift transition-smooth">
                            <h3 className="text-sm font-medium text-medium-blue mb-6 uppercase tracking-wider">
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
    );
}
