"use client";

import { useState, useEffect } from "react";
import { MotionContainer } from "@/components/motion-container";
import { KPICards } from "@/components/kpi-cards";
import { CollectionsTrend } from "@/components/collections-trend";
import { LayoutDashboard, Users, CreditCard, PieChart, Settings, LogOut } from "lucide-react";
import Link from "next/link";

const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/demo", active: true },
    { icon: Users, label: "Borrowers", href: "/demo", active: false },
    { icon: CreditCard, label: "Loans", href: "/demo", active: false },
    { icon: PieChart, label: "Reports", href: "/demo", active: false },
    { icon: Settings, label: "Settings", href: "/demo", active: false },
];

export default function DemoPage() {
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

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
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
                    {navItems.map((item, index) => {
                        const isActive = item.active;
                        return (
                            <div
                                key={index}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-smooth cursor-pointer ${
                                    isActive
                                        ? "bg-gradient-to-r from-cyan/20 to-blue/20 text-blue-deep shadow-soft border border-cyan/20"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground hover-scale"
                                }`}
                            >
                                <item.icon className={`h-5 w-5 transition-colors ${
                                    isActive ? "text-blue" : "text-muted-foreground"
                                }`} />
                                {item.label}
                            </div>
                        );
                    })}
                </div>

                {/* Sign Out Button */}
                <div className="border-t border-border/50 p-4">
                    <Link
                        href="/"
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-smooth hover-scale"
                    >
                        <LogOut className="h-5 w-5" />
                        Back to Home
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-20 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl shadow-sm">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-foreground">Dashboard Demo</h2>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* User Profile */}
                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 shadow-soft">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan to-blue flex items-center justify-center text-white font-semibold text-sm">
                                D
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-foreground">demo@stratos.com</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto bg-secondary/30 p-6">
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
                                    <div className="bg-gradient-to-br from-cyan/10 to-blue/10 rounded-2xl border border-cyan/20 p-6 shadow-soft hover-lift transition-smooth">
                                        <h3 className="text-sm font-medium text-blue-deep mb-6 uppercase tracking-wider">
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
                                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                                                    <polyline points="17 6 23 6 23 12"/>
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
