"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, ChevronRight, Search, User, CreditCard, CalendarCheck, CheckCircle2, Clock, Map } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { MotionContainer } from "@/components/motion-container";
import { Badge } from "@/components/ui/badge";

interface Borrower {
    id: string;
    full_name: string;
    phone: string;
    address: string;
    status: string;
}

interface TodayTask {
    loan_id: string;
    status: string;
    loan: {
        loan_number?: string;
        installment_amount: number;
        borrower: {
            id: string;
            full_name: string;
            phone: string;
            address: string;
        };
    };
}

export default function CollectorHomePage() {
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const [filteredBorrowers, setFilteredBorrowers] = useState<Borrower[]>([]);
    const [todayTasks, setTodayTasks] = useState<TodayTask[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const todayStr = new Date().toISOString().split("T")[0];

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch all active borrowers
            const { data: borrowerData } = await supabase
                .from("borrowers")
                .select("*")
                .eq("status", "active");

            if (borrowerData) {
                setBorrowers(borrowerData);
                setFilteredBorrowers(borrowerData);
            }

            // Fetch today's tasks for this collector
            const { data: taskData } = await supabase
                .from("daily_tasks")
                .select(`
                    loan_id,
                    status,
                    loan:loans(loan_number, installment_amount, borrower:borrowers(id, full_name, phone, address))
                `)
                .eq("collector_id", user.id)
                .eq("task_date", todayStr);

            if (taskData) setTodayTasks(taskData as any);

            setLoading(false);
        }

        fetchData();
    }, []);

    useEffect(() => {
        const lower = search.toLowerCase();
        setFilteredBorrowers(
            borrowers.filter(b =>
                b.full_name.toLowerCase().includes(lower) ||
                b.phone.includes(lower)
            )
        );
    }, [search, borrowers]);

    const completedCount = todayTasks.filter(t => t.status === "completed").length;
    const pendingCount = todayTasks.filter(t => t.status === "pending").length;

    return (
        <MotionContainer className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-4xl font-bold text-foreground tracking-tight">Borrowers</h1>
                    <p className="text-sm text-muted-foreground font-normal mt-1">Select a borrower to record payment</p>
                </div>
                <Link href="/collector/plan">
                    <Button className="rounded-full gap-2 bg-gradient-to-r from-light-blue to-medium-blue shadow-md" size="sm">
                        <Map className="h-4 w-4" />
                        Plan Route
                    </Button>
                </Link>
            </div>

            {/* Today's Route Summary (Only shown if tasks are planned) */}
            {todayTasks.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CalendarCheck className="h-4 w-4 text-primary" />
                            <h2 className="font-semibold text-foreground">Today's Route</h2>
                        </div>
                        <span className="text-xs text-muted-foreground">{completedCount}/{todayTasks.length} done</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${todayTasks.length > 0 ? (completedCount / todayTasks.length) * 100 : 0}%` }}
                        />
                    </div>
                    {/* Task cards */}
                    <div className="space-y-2">
                        {todayTasks.map(task => {
                            const borrowerId = (task.loan as any)?.borrower?.id;
                            return (
                                <Link href={borrowerId ? `/collector/borrower/${borrowerId}` : "#"} key={task.loan_id}>
                                    <div className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                                        task.status === "completed"
                                            ? "bg-emerald-50/50 border-emerald-200 opacity-75"
                                            : "bg-primary/5 border-primary/20 hover:border-primary/40"
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            {task.status === "completed"
                                                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                                : <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                            }
                                            <span className="font-medium">{(task.loan as any)?.borrower?.full_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground">LKR {task.loan?.installment_amount?.toLocaleString()}</span>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                    <hr className="border-border/50" />
                </div>
            )}

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-light-blue/10 to-medium-blue/10 rounded-2xl border border-light-blue/20 p-6 shadow-soft">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-medium-blue uppercase tracking-wider mb-2">Active Borrowers</p>
                        <p className="text-4xl font-bold text-foreground">{borrowers.length}</p>
                        <p className="text-sm text-muted-foreground mt-1">Total across system</p>
                    </div>
                    <div className="bg-gradient-to-br from-light-blue/30 to-medium-blue/10 p-4 rounded-2xl">
                        <User className="w-8 h-8 text-medium-blue" strokeWidth={2} />
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    className="pl-12 h-14 rounded-2xl bg-card border-border/50 focus:border-medium-blue transition-smooth shadow-soft text-base"
                    placeholder="Search by name or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Borrowers List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="font-medium">Loading borrowers...</span>
                        </div>
                    </div>
                ) : filteredBorrowers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <CreditCard className="w-16 h-16 opacity-20 mb-4" />
                        <p className="font-medium text-lg mb-1">No borrowers found</p>
                        <p className="text-sm">Try adjusting your search</p>
                    </div>
                ) : (
                    filteredBorrowers.map(borrower => (
                        <Link href={`/collector/borrower/${borrower.id}`} key={borrower.id}>
                            <Card className="hover:border-light-blue/40 transition-smooth shadow-soft hover-lift rounded-2xl border-border/50">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-light-blue to-medium-blue flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                                            {borrower.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="space-y-1.5">
                                            <h3 className="font-bold text-foreground text-lg">{borrower.full_name}</h3>
                                            <div className="flex items-center text-sm text-muted-foreground gap-1">
                                                <Phone className="h-4 w-4" strokeWidth={2} />
                                                <span className="font-medium">{borrower.phone}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-muted-foreground gap-1">
                                                <MapPin className="h-4 w-4" strokeWidth={2} />
                                                <span className="line-clamp-1">{borrower.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0" strokeWidth={2} />
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </MotionContainer>
    );
}
