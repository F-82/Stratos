"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, CheckCircle, Circle, CalendarCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MotionContainer } from "@/components/motion-container";

interface ActiveLoan {
    id: string;
    loan_number?: string;
    installment_amount: number;
    borrower: {
        id: string;
        full_name: string;
        phone: string;
        address: string;
    };
}

export default function PlanTodayPage() {
    const [loans, setLoans] = useState<ActiveLoan[]>([]);
    const [filtered, setFiltered] = useState<ActiveLoan[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [existingTaskLoanIds, setExistingTaskLoanIds] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const todayStr = new Date().toISOString().split("T")[0];

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch all active loans with borrower info
            const { data: loansData } = await supabase
                .from("loans")
                .select("id, loan_number, installment_amount, borrower:borrowers(id, full_name, phone, address)")
                .eq("status", "active");

            if (loansData) setLoans(loansData as any);

            // Fetch today's existing tasks for this collector
            const { data: tasksData } = await supabase
                .from("daily_tasks")
                .select("loan_id")
                .eq("collector_id", user.id)
                .eq("task_date", todayStr);

            if (tasksData) {
                const ids = new Set(tasksData.map(t => t.loan_id));
                setExistingTaskLoanIds(ids);
                setSelected(new Set(ids));
            }

            setLoading(false);
        }
        fetchData();
    }, []);

    useEffect(() => {
        const lower = search.toLowerCase();
        setFiltered(
            loans.filter(l =>
                l.borrower?.full_name?.toLowerCase().includes(lower) ||
                l.borrower?.phone?.includes(lower) ||
                l.loan_number?.includes(lower)
            )
        );
    }, [search, loans]);

    const toggleSelect = (loanId: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(loanId)) {
                next.delete(loanId);
            } else {
                next.add(loanId);
            }
            return next;
        });
    };

    const handleSave = async () => {
        if (selected.size === 0) {
            toast.error("Please select at least one loan to plan.");
            return;
        }

        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setSaving(false); return; }

        // Determine new tasks (not already existing)
        const newLoanIds = [...selected].filter(id => !existingTaskLoanIds.has(id));
        const removedLoanIds = [...existingTaskLoanIds].filter(id => !selected.has(id));

        let hasError = false;

        // Insert new tasks
        if (newLoanIds.length > 0) {
            const tasksToInsert = newLoanIds.map(loan_id => ({
                collector_id: user.id,
                loan_id,
                task_date: todayStr,
                status: "pending"
            }));
            const { error } = await supabase.from("daily_tasks").insert(tasksToInsert);
            if (error) { toast.error("Failed to save route: " + error.message); hasError = true; }
        }

        // Remove deselected tasks (only if pending)
        if (removedLoanIds.length > 0 && !hasError) {
            const { error } = await supabase
                .from("daily_tasks")
                .delete()
                .in("loan_id", removedLoanIds)
                .eq("collector_id", user.id)
                .eq("task_date", todayStr)
                .eq("status", "pending");
            if (error) { toast.error("Failed to update route: " + error.message); hasError = true; }
        }

        if (!hasError) {
            toast.success(`Route planned: ${selected.size} collection(s) for today!`);
            router.push("/collector");
        }
        setSaving(false);
    };

    return (
        <MotionContainer className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/collector">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Plan Today's Route</h1>
                    <p className="text-sm text-muted-foreground">Select the borrowers you plan to visit today</p>
                </div>
            </div>

            {/* Selection count */}
            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-primary font-medium">
                    <CalendarCheck className="h-5 w-5" />
                    <span>{selected.size} collection(s) planned</span>
                </div>
                <Button onClick={handleSave} disabled={saving || loading} size="sm" className="rounded-full">
                    {saving ? "Saving..." : "Save Route"}
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    className="pl-11 rounded-2xl bg-card border-border/50"
                    placeholder="Search borrower or loan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Loan List */}
            <div className="space-y-3">
                {loading ? (
                    <p className="text-center text-muted-foreground py-8">Loading loans...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No active loans found.</p>
                ) : (
                    filtered.map(loan => {
                        const isSelected = selected.has(loan.id);
                        const isExisting = existingTaskLoanIds.has(loan.id);
                        return (
                            <Card
                                key={loan.id}
                                onClick={() => toggleSelect(loan.id)}
                                className={`cursor-pointer transition-all duration-200 rounded-2xl ${
                                    isSelected
                                        ? "border-primary/60 bg-primary/5 shadow-md"
                                        : "border-border/50 hover:border-light-blue/40"
                                }`}
                            >
                                <CardContent className="p-4 flex items-center gap-4">
                                    {isSelected
                                        ? <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                                        : <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                    }
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-foreground truncate">{loan.borrower?.full_name}</h3>
                                            {isExisting && (
                                                <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Already Planned</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{loan.borrower?.phone} • {loan.borrower?.address}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-bold text-foreground">LKR {loan.installment_amount?.toLocaleString()}</p>
                                        {loan.loan_number && <p className="text-xs text-muted-foreground">#{loan.loan_number}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </MotionContainer>
    );
}
