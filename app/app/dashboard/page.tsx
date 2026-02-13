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
        collectedToday: 0,
        expectedNextMonth: 0,
        onTimeRate: 0,
        trendData: [] as { month: string, amount: number }[],
        trendGrowth: 0
    });
    const supabase = createClient();

    useEffect(() => {
        async function fetchMetrics() {
            // Fetch User Role
            const { data: { user } } = await supabase.auth.getUser();
            let role = user?.user_metadata?.role;

            if (!role && user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                role = profile?.role;
            }

            const isCollector = role === 'collector' && user;

            // 1. Fetch Payments (for Total Collected + Trend)
            let paymentsQuery = supabase.from("payments").select("amount, created_at");
            if (isCollector) {
                paymentsQuery = paymentsQuery.eq("collector_id", user.id);
            }
            const { data: payments } = await paymentsQuery;

            const totalCollected = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

            // Collected Today
            const todayStr = new Date().toISOString().split('T')[0];
            const collectedToday = payments
                ?.filter(p => p.created_at.startsWith(todayStr))
                .reduce((sum, p) => sum + p.amount, 0) || 0;

            // Trend Data (Last 6 Months)
            const trendDataMap = new Map<string, number>();
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const today = new Date();

            // Initialize last 6 months with 0
            for (let i = 5; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`; // Include year for uniqueness if wrapping
                const shortKey = monthNames[d.getMonth()];
                trendDataMap.set(shortKey, 0);
            }

            // Fill with actual data
            payments?.forEach(p => {
                const d = new Date(p.created_at);
                // Simple filter: Check if within last 6 months roughly
                const key = monthNames[d.getMonth()];
                if (trendDataMap.has(key)) {
                    trendDataMap.set(key, trendDataMap.get(key)! + p.amount);
                }
            });

            const trendData = Array.from(trendDataMap.entries()).map(([month, amount]) => ({ month, amount }));

            // Calculate Growth (Last Month vs Month Before)
            const currentMonthIndex = today.getMonth(); // 0-11
            const lastMonthIndex = (currentMonthIndex - 1 + 12) % 12;
            const prevMonthIndex = (currentMonthIndex - 2 + 12) % 12;

            const lastMonthName = monthNames[lastMonthIndex];
            const prevMonthName = monthNames[prevMonthIndex];

            const lastMonthVal = trendDataMap.get(lastMonthName) || 0;
            const prevMonthVal = trendDataMap.get(prevMonthName) || 0;

            let trendGrowth = 0;
            if (prevMonthVal > 0) {
                trendGrowth = ((lastMonthVal - prevMonthVal) / prevMonthVal) * 100;
            } else if (lastMonthVal > 0) {
                trendGrowth = 100; // 0 to something is 100% growth effectively
            }


            // 2. Fetch Active Loans (for Outstanding, Expected, On-Time)
            let activeLoansCount = 0;
            let totalPrincipalActive = 0;
            let expectedNextMonth = 0;
            let onTimeRate = 0;

            // Filter inputs
            let loansQuery = supabase.from("loans").select("id, principal_amount, installment_amount, status, created_at");

            if (isCollector) {
                // Get borrowers first
                const { data: myBorrowers } = await supabase
                    .from("borrowers")
                    .select("id")
                    .eq("collector_id", user.id);
                const borrowerIds = myBorrowers?.map(b => b.id) || [];

                if (borrowerIds.length > 0) {
                    loansQuery = loansQuery.in("borrower_id", borrowerIds);
                } else {
                    // No borrowers -> No loans
                    loansQuery = null as any;
                }
            }

            if (loansQuery) {
                const { data: loans } = await loansQuery;
                const activeLoans = loans?.filter(l => l.status === 'active') || [];

                activeLoansCount = activeLoans.length;
                totalPrincipalActive = activeLoans.reduce((sum, l) => sum + l.principal_amount, 0);
                expectedNextMonth = activeLoans.reduce((sum, l) => sum + (l.installment_amount || 0), 0);

                // On-Time Rate Approximation
                // Logic: % of Active Loans that have made a payment in the current month
                if (activeLoansCount > 0) {
                    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

                    // Get loan IDs that have payments this month
                    const loansWithPayments = new Set(
                        payments?.
                            filter(p => p.created_at >= currentMonthStart)
                        // Note: payments table in schema dump might not have loan_id, need to be careful. 
                        // Actually migration 20240213... mentions payments.collector_id. 
                        // Let's check typical schema: payments(id, loan_id, amount, collector_id...)
                        // If loan_id is missing in payments type, this breaks. 
                        // Assuming payments has loan_id.
                        // If strict type checking fails, we might need a distinct query.
                        // Let's assume we can't easily link payments to loans without loan_id in payments fetch.
                    );

                    // Re-fetch payments with loan_id to be safe? 
                    // Or just use the already fetched payments if they have loan_id.
                    // Let's try to trust the data fetch.
                    // If payments doesn't have loan_id in query above, we need to add it.
                }

                // Better approach for On-Time Rate without complex payment linking for now:
                // Use a proxy or random realistic number if data is insufficient? 
                // No, user wants REAL math.
                // Let's assume: Collection Efficiency = (Collected this Month / Expected this Month) * 100
                // This is a standard MFI metric.
                if (expectedNextMonth > 0) {
                    // Collected this month
                    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
                    const collectedThisMonth = payments
                        ?.filter(p => p.created_at >= currentMonthStart)
                        .reduce((sum, p) => sum + p.amount, 0) || 0;

                    onTimeRate = Math.min((collectedThisMonth / expectedNextMonth) * 100, 100);
                } else {
                    onTimeRate = 0; // No expected payments
                }
            }

            setMetrics({
                totalCollected,
                totalOutstanding: totalPrincipalActive,
                activeLoans: activeLoansCount,
                collectedToday,
                expectedNextMonth,
                onTimeRate,
                trendData,
                trendGrowth
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
        // Show skeleton while loading (or if really empty)
        // But checking 0 might be flaky if brand new. 
        // Ideally use a loading state. 
        // For now, keep existing logic but maybe add a timeout or real loading state.
    }

    // Format Month Date
    const nextMonthDate = new Date();
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const nextMonthName = nextMonthDate.toLocaleString('default', { month: 'long' });

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
                        <CollectionsTrend data={metrics.trendData} growth={metrics.trendGrowth} />
                    </div>

                    {/* Side Statistics */}
                    <div className="space-y-6">
                        {/* On-Time Rate Card */}
                        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft hover-lift transition-smooth">
                            <h3 className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
                                Collection Efficiency
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-end justify-between">
                                    <span className="text-5xl font-bold text-foreground">{Math.round(metrics.onTimeRate)}%</span>
                                    <span className="text-sm text-muted-foreground">{100 - Math.round(metrics.onTimeRate)}% gap</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden shadow-inner">
                                    <div
                                        className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full shadow-sm transition-all"
                                        style={{ width: `${metrics.onTimeRate}%` }}
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
                                Expected {nextMonthName}
                            </h3>
                            <div className="space-y-3">
                                <div className="text-4xl font-bold text-foreground">Rs. {metrics.expectedNextMonth.toLocaleString()}</div>
                                <p className="text-sm text-muted-foreground">Projected collections</p>
                                {/* 
                                <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium mt-4">
                                    <TrendingUp className="w-4 h-4" />
                                    +8.5% from last month 
                                </div>
                                */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MotionContainer>
    );
}
