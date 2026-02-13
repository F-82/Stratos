"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/utils/supabase/client";
import { Eye, User, Calendar, DollarSign, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { addMonths, format, isAfter, isBefore } from "date-fns";

interface LoanDetailsDialogProps {
    loanId: string;
}

export function LoanDetailsDialog({ loanId }: LoanDetailsDialogProps) {
    const [loan, setLoan] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!isOpen) return;

        async function fetchDetails() {
            setLoading(true);
            try {
                // Fetch Loan + Borrower + Plan (Remove direct join to profiles which triggers FK error)
                const { data: loanData, error } = await supabase
                    .from("loans")
                    .select(`
                        *,
                        borrower:borrowers (
                            id, full_name, nic_number, address, collector_id
                        ),
                        plan:loan_plans (name, duration_months, installment_amount)
                    `)
                    .eq("id", loanId)
                    .single();

                if (error) throw error;

                if (loanData) {
                    // Manually fetch collector profile if exists
                    if (loanData.borrower?.collector_id) {
                        const { data: collectorProfile } = await supabase
                            .from("profiles")
                            .select("full_name, email")
                            .eq("id", loanData.borrower.collector_id)
                            .single();

                        // Attach to borrower object for UI compatibility
                        // @ts-ignore
                        loanData.borrower.collector = collectorProfile;
                    }

                    setLoan(loanData);

                    // Fetch Payments
                    const { data: paymentData } = await supabase
                        .from("payments")
                        .select("*")
                        .eq("loan_id", loanId)
                        .order("installment_number", { ascending: true });

                    setPayments(paymentData || []);
                }
            } catch (err) {
                console.error("Error fetching loan details:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchDetails();
    }, [isOpen, loanId, supabase]);

    // Construct Schedule
    const schedule = [];
    if (loan) {
        const startDate = new Date(loan.start_date);
        const duration = loan.plan.duration_months;
        const totalPaid = payments.length;

        for (let i = 1; i <= duration; i++) {
            const dueDate = addMonths(startDate, i);
            const payment = payments.find(p => p.installment_number === i);
            const isPaid = !!payment;
            const isLate = !isPaid && isAfter(new Date(), dueDate); // Due date passed and not paid

            schedule.push({
                installment: i,
                dueDate,
                amount: loan.plan.installment_amount,
                status: isPaid ? 'Paid' : isLate ? 'Overdue' : 'Pending',
                paidDate: payment ? new Date(payment.created_at) : null,
                collector: payment ? 'Collected' : '-' // Could show who collected if stored
            });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-xl hover:bg-secondary transition-smooth">
                    <Eye className="mr-2 h-4 w-4" />
                    Details
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-6xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Loan Details</DialogTitle>
                </DialogHeader>

                {loading || !loan ? (
                    <div className="p-8 text-center text-muted-foreground">Loading details...</div>
                ) : (
                    <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
                        {/* Summary Header */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-secondary/20 p-4 rounded-xl border border-secondary">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Borrower</p>
                                <div className="font-semibold flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    {loan.borrower.full_name}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Collector</p>
                                <div className="font-semibold flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-medium-blue" />
                                    {loan.borrower.collector?.full_name || "Unassigned"}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Progress</p>
                                <div className="font-semibold flex items-center gap-2">
                                    <span className="text-lg">{payments.length}</span>
                                    <span className="text-sm text-muted-foreground">/ {loan.plan.duration_months} Paid</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                                <Badge variant={loan.status === 'active' ? 'default' : 'secondary'} className="uppercase">
                                    {loan.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Schedule List */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Repayment Schedule
                            </h3>
                            <div className="border rounded-xl overflow-hidden shadow-sm flex-1">
                                <div className="grid grid-cols-5 p-3 bg-secondary/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                                    <div>Inst. #</div>
                                    <div>Due Date</div>
                                    <div>Amount</div>
                                    <div>Status</div>
                                    <div>Paid Date</div>
                                </div>
                                <ScrollArea className="h-[400px]">
                                    {schedule.map((item) => (
                                        <div key={item.installment} className="grid grid-cols-5 p-3 text-sm border-b last:border-0 hover:bg-secondary/20 transition-colors items-center">
                                            <div className="font-medium text-muted-foreground">#{item.installment}</div>
                                            <div>{format(item.dueDate, 'MMM d, yyyy')}</div>
                                            <div className="font-medium font-mono">Rs. {item.amount.toLocaleString()}</div>
                                            <div>
                                                <Badge
                                                    variant="outline"
                                                    className={`
                                                        ${item.status === 'Paid' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : ''}
                                                        ${item.status === 'Overdue' ? 'border-red-500 text-red-600 bg-red-50' : ''}
                                                        ${item.status === 'Pending' ? 'border-blue-200 text-blue-600 bg-blue-50' : ''}
                                                    `}
                                                >
                                                    {item.status}
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.paidDate ? format(item.paidDate, 'MMM d, HH:mm') : '-'}
                                            </div>
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
