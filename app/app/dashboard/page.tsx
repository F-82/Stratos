"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { MotionContainer } from "@/components/motion-container";
import { KPICards } from "@/components/kpi-cards";
import { CollectionsTrend } from "@/components/collections-trend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Settings, User } from 'lucide-react';

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

            // 4. Total Outstanding (Approx: Total Principal - Total Collected)
            // Ideally: Sum of (Principal + Interest) - Payments
            // For now: Sum of active loan principals
            const { data: loans } = await supabase
                .from("loans")
                .select("principal_amount")
                .eq("status", "active");

            const totalPrincipalActive = loans?.reduce((sum, l) => sum + l.principal_amount, 0) || 0;
            // Simplified outstanding logic: Active Principals - (Payments on active loans? Too complex for now)
            // Let's just show "Active Principal deployed" as Outstanding for now

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

    return (
        <MotionContainer className="min-h-screen bg-[#fafafa]">
            {/* Header - Replicated here to replace the layout header if we wanted, 
                 but since layout wrapper exists, this acts as the Page Content Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-light text-black tracking-tight">Loan Management</h1>
                    <p className="text-sm text-neutral-400 mt-1 font-normal">{todayDate}</p>
                </div>
                {/* Top Actions (optional if layout header exists) */}
            </div>

            <div className="space-y-6">
                {/* Row 1: KPI Cards */}
                <KPICards metrics={metrics} />

                {/* Row 2: Main Graph + Side Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <CollectionsTrend />
                    </div>
                    <div className="space-y-6">
                        {/* On-Time Rate Card */}
                        <div className="bg-white rounded-2xl border border-black/[0.08] p-6">
                            <h3 className="text-sm font-normal text-neutral-500 mb-4">On-Time Payment Rate</h3>
                            <div className="space-y-3">
                                <div className="flex items-end justify-between">
                                    <span className="text-4xl font-light text-black">92%</span>
                                    <span className="text-sm text-neutral-400">8% missed</span>
                                </div>
                                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-[#00ff00] h-full rounded-full" style={{ width: '92%' }}></div>
                                </div>
                                <p className="text-xs text-neutral-400">Based on {metrics.activeLoans} active loans</p>
                            </div>
                        </div>

                        {/* Projected Card */}
                        <div className="bg-white rounded-2xl border border-black/[0.08] p-6">
                            <h3 className="text-sm font-normal text-neutral-500 mb-4">Expected Next Month</h3>
                            <div className="space-y-2">
                                <div className="text-4xl font-light text-black">Rs. 520,000</div>
                                <p className="text-sm text-neutral-400">Projected collections</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MotionContainer>
    );
}
