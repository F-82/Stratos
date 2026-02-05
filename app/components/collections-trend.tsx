"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
    { month: 'Sep', amount: 380 },
    { month: 'Oct', amount: 410 },
    { month: 'Nov', amount: 435 },
    { month: 'Dec', amount: 455 },
    { month: 'Jan', amount: 468 },
    { month: 'Feb', amount: 482 },
];

export function CollectionsTrend() {
    return (
        <div className="bg-card rounded-2xl border border-border/50 p-6 h-full shadow-soft hover-lift transition-smooth">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Collections Trend</h2>
                    <p className="text-sm text-muted-foreground mt-2 font-normal">Last 6 months performance</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-xl text-sm font-semibold text-emerald-700 shadow-soft">
                    <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                    <span>+17.6%</span>
                </div>
            </div>

            <div className="w-full" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#7DD3E8" />
                                <stop offset="50%" stopColor="#5B8FB9" />
                                <stop offset="100%" stopColor="#3D5A80" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="rgba(0, 0, 0, 0.06)" 
                            vertical={false} 
                        />
                        <XAxis
                            dataKey="month"
                            stroke="#9CA3AF"
                            style={{ fontSize: '12px', fontWeight: '500' }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            style={{ fontSize: '12px', fontWeight: '500' }}
                            tickFormatter={(value) => `${value}K`}
                            axisLine={false}
                            tickLine={false}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1A2332',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: '500',
                                padding: '12px 16px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                            }}
                            formatter={(value: any) => [`Rs. ${value}K`, 'Collections']}
                            labelStyle={{ color: '#B8E8F5', fontWeight: '600', marginBottom: '4px' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="url(#lineGradient)"
                            strokeWidth={3}
                            dot={{ 
                                fill: '#5B8FB9', 
                                strokeWidth: 3, 
                                stroke: '#fff',
                                r: 5 
                            }}
                            activeDot={{ 
                                r: 7, 
                                fill: '#7DD3E8',
                                stroke: '#fff',
                                strokeWidth: 3
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
