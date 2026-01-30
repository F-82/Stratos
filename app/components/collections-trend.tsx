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
        <div className="bg-white rounded-2xl border border-black/[0.08] p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-light text-black tracking-tight">Collections Trend</h2>
                    <p className="text-sm text-neutral-400 mt-1 font-normal">Last 6 months performance</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00ff00]/10 rounded-lg text-sm font-normal text-black">
                    <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                    <span>+17.6%</span>
                </div>
            </div>

            <div className="w-full" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="#a3a3a3"
                            style={{ fontSize: '11px', fontWeight: '400' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#a3a3a3"
                            style={{ fontSize: '11px', fontWeight: '400' }}
                            tickFormatter={(value) => `${value}K`}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#000000',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '12px',
                                fontWeight: '400'
                            }}
                            formatter={(value: any) => [`Rs. ${value}K`, 'Collections']}
                        />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#00ff00"
                            strokeWidth={2}
                            dot={{ fill: '#00ff00', strokeWidth: 0, r: 3 }}
                            activeDot={{ r: 5, fill: '#00ff00' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
