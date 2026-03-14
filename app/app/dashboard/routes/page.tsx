"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Users, TrendingUp } from "lucide-react";
import { MotionContainer } from "@/components/motion-container";

interface CollectorTask {
    collector_id: string;
    collector_name: string;
    planned: number;
    completed: number;
    missed: number;
    pending: number;
    tasks: TaskDetail[];
}

interface TaskDetail {
    id: string;
    loan_id: string;
    status: string;
    borrower_name: string;
    loan_number?: string;
    installment_amount: number;
}

export default function RouteMonitoringPage() {
    const [collectorData, setCollectorData] = useState<CollectorTask[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const todayStr = new Date().toISOString().split("T")[0];
    const todayDisplay = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    useEffect(() => {
        async function fetchRoutes() {
            // Fetch all daily tasks for today with collector, loan, and borrower info
            const { data: tasks, error } = await supabase
                .from("daily_tasks")
                .select(`
                    id,
                    collector_id,
                    loan_id,
                    status,
                    collector:profiles!daily_tasks_collector_id_fkey(full_name),
                    loan:loans(loan_number, installment_amount, borrower:borrowers(full_name))
                `)
                .eq("task_date", todayStr)
                .order("collector_id");

            if (error) {
                console.error("Error loading tasks:", error);
                setLoading(false);
                return;
            }

            // Group by collector
            const grouped = new Map<string, CollectorTask>();

            tasks?.forEach((task: any) => {
                const cid = task.collector_id;
                if (!grouped.has(cid)) {
                    grouped.set(cid, {
                        collector_id: cid,
                        collector_name: task.collector?.full_name || "Unknown",
                        planned: 0,
                        completed: 0,
                        missed: 0,
                        pending: 0,
                        tasks: []
                    });
                }
                const entry = grouped.get(cid)!;
                entry.planned++;
                if (task.status === "completed") entry.completed++;
                else if (task.status === "missed") entry.missed++;
                else entry.pending++;

                entry.tasks.push({
                    id: task.id,
                    loan_id: task.loan_id,
                    status: task.status,
                    borrower_name: task.loan?.borrower?.full_name || "Unknown",
                    loan_number: task.loan?.loan_number,
                    installment_amount: task.loan?.installment_amount || 0
                });
            });

            setCollectorData(Array.from(grouped.values()));
            setLoading(false);
        }
        fetchRoutes();
    }, []);

    const statusIcon = (status: string) => {
        if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
        if (status === "missed") return <XCircle className="h-4 w-4 text-red-500" />;
        return <Clock className="h-4 w-4 text-amber-500" />;
    };

    const statusBadge = (status: string) => {
        if (status === "completed") return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Collected</Badge>;
        if (status === "missed") return <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Missed</Badge>;
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Pending</Badge>;
    };

    return (
        <MotionContainer className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Route Monitoring</h2>
                <p className="text-sm text-muted-foreground mt-1">{todayDisplay}</p>
            </div>

            {loading ? (
                <div className="text-center py-16 text-muted-foreground">Loading today's routes...</div>
            ) : collectorData.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="p-12 text-center text-muted-foreground space-y-2">
                        <Users className="h-12 w-12 opacity-20 mx-auto" />
                        <p className="font-medium">No routes planned for today</p>
                        <p className="text-sm">Collectors have not logged any routes yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {/* Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-soft">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Collectors Active</p>
                            <p className="text-3xl font-bold text-foreground">{collectorData.length}</p>
                        </div>
                        <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-soft">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Planned</p>
                            <p className="text-3xl font-bold text-foreground">{collectorData.reduce((s, c) => s + c.planned, 0)}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 shadow-soft">
                            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-2">Collected</p>
                            <p className="text-3xl font-bold text-emerald-700">
                                {collectorData.reduce((s, c) => s + c.completed, 0)}
                                <span className="text-base font-normal text-emerald-500"> / {collectorData.reduce((s, c) => s + c.planned, 0)}</span>
                            </p>
                        </div>
                    </div>

                    {/* Per-Collector cards */}
                    {collectorData.map(collector => (
                        <Card key={collector.collector_id} className="rounded-2xl border-border/50 shadow-soft">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-light-blue to-medium-blue flex items-center justify-center text-white font-bold">
                                            {collector.collector_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{collector.collector_name}</CardTitle>
                                            <p className="text-xs text-muted-foreground">{collector.planned} planned today</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                            <CheckCircle2 className="h-4 w-4" />{collector.completed}
                                        </span>
                                        <span className="flex items-center gap-1 text-amber-600 font-medium">
                                            <Clock className="h-4 w-4" />{collector.pending}
                                        </span>
                                        {collector.missed > 0 && (
                                            <span className="flex items-center gap-1 text-red-600 font-bold">
                                                <XCircle className="h-4 w-4" />{collector.missed}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {/* Progress Bar */}
                                <div className="w-full bg-secondary rounded-full h-2 mb-4 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${collector.planned > 0 ? (collector.completed / collector.planned) * 100 : 0}%` }}
                                    />
                                </div>
                                {/* Task List */}
                                <div className="space-y-2">
                                    {collector.tasks.map(task => (
                                        <div key={task.id} className={`flex items-center justify-between p-3 rounded-xl border text-sm ${
                                            task.status === "missed" ? "bg-red-50/50 border-red-100" :
                                            task.status === "completed" ? "bg-emerald-50/50 border-emerald-100" :
                                            "bg-secondary/30 border-border/30"
                                        }`}>
                                            <div className="flex items-center gap-2">
                                                {statusIcon(task.status)}
                                                <span className="font-medium">{task.borrower_name}</span>
                                                {task.loan_number && (
                                                    <span className="text-xs text-muted-foreground">#{task.loan_number}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground font-medium">LKR {task.installment_amount.toLocaleString()}</span>
                                                {statusBadge(task.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </MotionContainer>
    );
}
