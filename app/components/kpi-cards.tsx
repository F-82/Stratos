"use client";

import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Users, Wallet, BadgeDollarSign, Calendar } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: React.ReactNode;
    iconBg: string;
    subtitle?: string;
    alert?: boolean;
}

function KPICard({ title, value, change, changeType, icon, iconBg, subtitle, alert }: KPICardProps) {
    return (
        <div className={`bg-card rounded-2xl border ${alert ? 'border-cyan/30 shadow-card' : 'border-border/50'} p-6 hover:border-cyan/40 transition-smooth hover-lift shadow-soft`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`${iconBg} p-3 rounded-xl shadow-soft`}>
                    {icon}
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                        changeType === 'positive' 
                            ? 'text-emerald-600 bg-emerald-50' 
                            : changeType === 'negative' 
                            ? 'text-red-600 bg-red-50' 
                            : 'text-muted-foreground bg-secondary'
                    }`}>
                        {changeType === 'positive' && <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />}
                        {changeType === 'negative' && <TrendingDown className="w-3.5 h-3.5" strokeWidth={2} />}
                        {change}
                    </div>
                )}
            </div>

            <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">{title}</h3>
            <div className="text-3xl font-bold text-foreground mb-1 tracking-tight">{value}</div>
            {subtitle && (
                <p className="text-xs text-muted-foreground font-normal">{subtitle}</p>
            )}
        </div>
    );
}

export function KPICards({ metrics }: { metrics: any }) {
    // Format currency
    const fmt = (n: number) => `Rs. ${n.toLocaleString()}`;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <KPICard
                title="Total Collected"
                value={fmt(metrics.totalCollected)}
                change="+12%"
                changeType="positive"
                icon={<DollarSign className="w-5 h-5 text-emerald-600" strokeWidth={2} />}
                iconBg="bg-gradient-to-br from-emerald-100 to-emerald-50"
                subtitle="All time collections"
            />

            <KPICard
                title="Outstanding"
                value={fmt(metrics.totalOutstanding)}
                icon={<Wallet className="w-5 h-5 text-blue" strokeWidth={2} />}
                iconBg="bg-gradient-to-br from-cyan/20 to-blue/10"
                subtitle="Principal still in field"
            />

            <KPICard
                title="Active Loans"
                value={metrics.activeLoans.toString()}
                icon={<Users className="w-5 h-5 text-blue-deep" strokeWidth={2} />}
                iconBg="bg-gradient-to-br from-blue/20 to-blue-deep/10"
                subtitle="Borrowers with active status"
            />

            <KPICard
                title="Collected Today"
                value={fmt(metrics.collectedToday)}
                changeType="neutral"
                icon={<Calendar className="w-5 h-5 text-cyan" strokeWidth={2} />}
                iconBg="bg-gradient-to-br from-cyan/30 to-cyan/10"
                subtitle={new Date().toLocaleDateString()}
            />
        </div>
    );
}
