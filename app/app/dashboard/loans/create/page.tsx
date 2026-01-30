"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { addMonths, format } from "date-fns";

interface Borrower {
    id: string;
    full_name: string;
    nic_number: string;
}

interface LoanPlan {
    id: number;
    name: string;
    principal_amount: number;
    installment_amount: number;
    duration_months: number;
}

export default function CreateLoanPage() {
    const router = useRouter();
    const supabase = createClient();
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const [plans, setPlans] = useState<LoanPlan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>("");
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");

    useEffect(() => {
        async function fetchData() {
            const { data: borrowersData } = await supabase.from("borrowers").select("id, full_name, nic_number").eq('status', 'active');
            const { data: plansData } = await supabase.from("loan_plans").select("*");

            if (borrowersData) setBorrowers(borrowersData);
            if (plansData) setPlans(plansData);
        }
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!selectedBorrowerId || !selectedPlanId) {
            setError("Please select both a borrower and a loan plan.");
            setLoading(false);
            return;
        }

        const plan = plans.find(p => p.id.toString() === selectedPlanId);
        if (!plan) return;

        // Check 1: Active Loan Constraint
        const { data: activeLoans } = await supabase
            .from("loans")
            .select("id")
            .eq("borrower_id", selectedBorrowerId)
            .eq("status", "active");

        if (activeLoans && activeLoans.length > 0) {
            setError("Borrower already has an active loan. They must complete it before taking a new one.");
            setLoading(false);
            return;
        }

        // Check 2: First-Time Borrower Limit (Max 20,000)
        const { count: totalLoans } = await supabase
            .from("loans")
            .select("id", { count: 'exact', head: true })
            .eq("borrower_id", selectedBorrowerId);

        if (totalLoans === 0 && plan.principal_amount > 20000) {
            setError("First-time borrowers are limited to loans of LKR 20,000 maximum.");
            setLoading(false);
            return;
        }

        const startDate = new Date();
        const endDate = addMonths(startDate, plan.duration_months);

        const loanData = {
            borrower_id: selectedBorrowerId,
            plan_id: parseInt(selectedPlanId),
            start_date: format(startDate, 'yyyy-MM-dd'),
            end_date: format(endDate, 'yyyy-MM-dd'),
            principal_amount: plan.principal_amount,
            installment_amount: plan.installment_amount,
            status: 'active'
        };

        const { error: insertError } = await supabase
            .from("loans")
            .insert([loanData]);

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
        } else {
            router.push("/dashboard/loans");
            router.refresh();
        }
    };

    const selectedPlan = plans.find(p => p.id.toString() === selectedPlanId);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/loans">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight text-primary">Issue New Loan</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Loan Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <Label>Select Borrower</Label>
                            <Select onValueChange={setSelectedBorrowerId} value={selectedBorrowerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Search borrower..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {borrowers.map((b) => (
                                        <SelectItem key={b.id} value={b.id}>
                                            {b.full_name} ({b.nic_number})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Select Loan Plan</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={`cursor-pointer rounded-lg border p-4 hover:bg-secondary/50 transition-colors ${selectedPlanId === plan.id.toString() ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}`}
                                        onClick={() => setSelectedPlanId(plan.id.toString())}
                                    >
                                        <div className="font-semibold">{plan.name}</div>
                                        <div className="text-2xl font-bold mt-2">LKR {plan.principal_amount.toLocaleString()}</div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {plan.duration_months} Months @ {plan.installment_amount.toLocaleString()}/mo
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedPlan && (
                            <div className="rounded-lg bg-secondary/50 p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Payable:</span>
                                    <span className="font-medium">LKR {(selectedPlan.installment_amount * selectedPlan.duration_months).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">End Date:</span>
                                    <span className="font-medium">{format(addMonths(new Date(), selectedPlan.duration_months), 'MMM d, yyyy')}</span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                                {loading ? "Processing..." : "Issue Loan"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
