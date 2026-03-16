"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Printer, RefreshCcw, CreditCard, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addDays, addMonths, addWeeks, format, isAfter, isBefore } from "date-fns";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function BorrowerCollectionPage({ params }: PageProps) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const [borrower, setBorrower] = useState<any>(null);
    const [loans, setLoans] = useState<any[]>([]);
    const [selectedLoan, setSelectedLoan] = useState<any>(null);
    const [lastPayment, setLastPayment] = useState<any>(null);
    const [allPayments, setAllPayments] = useState<any[]>([]);
    const [paidCount, setPaidCount] = useState(0);
    const [targetInstallment, setTargetInstallment] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: bData } = await supabase.from("borrowers").select("*").eq("id", id).single();
                if (bData) setBorrower(bData);

                // Fetch loan with duration details
                const { data: lData, error } = await supabase
                    .from("loans")
                    .select("*, loan_number, plan:loan_plans(name, installment_amount, duration, installment_type)")
                    .eq("borrower_id", id)
                    .eq("status", "active");

                if (error) {
                    console.error("Supabase Error fetching loans:", error);
                    return;
                }

                if (lData && lData.length > 0) {
                    const activeLoan = lData[0];
                    setLoans(lData);
                    setSelectedLoan(activeLoan);

                    // Fetch all payments for this loan
                    const { data: pData } = await supabase
                        .from("payments")
                        .select("*")
                        .eq("loan_id", activeLoan.id);

                    setAllPayments(pData || []);
                    setPaidCount(pData?.length || 0);

                    // Auto-select the first unpaid installment 
                    const firstUnpaid = (pData?.length || 0) + 1;
                    if (firstUnpaid <= activeLoan.plan.duration) {
                        setTargetInstallment(firstUnpaid);
                    }
                }
            } catch (err) {
                console.error("Unexpected fetch error:", err);
            }
        }
        fetchData();
    }, [id, supabase]);

    const handleRefresh = () => {
        setLoading(true);
        window.location.reload();
    };

    const handlePayment = async () => {
        if (!selectedLoan || !targetInstallment) return;

        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        const installmentAmount = selectedLoan.plan.installment_amount;
        
        const { data, error } = await supabase.from("payments").insert([{
            loan_id: selectedLoan.id,
            collector_id: user?.id,
            amount: installmentAmount,
            installment_number: targetInstallment,
            notes: "Mobile collection"
        }]).select().single();

        if (error) {
            alert("Error: " + error.message);
        } else {
            setSuccessMsg(`Collected Installment #${targetInstallment} successfully!`);
            setLastPayment(data);
            setAllPayments(prev => [...prev, data]);
            setPaidCount(prev => prev + 1);

            // Move target to next unpaid if available
            const nextTarget = targetInstallment + 1;
            if (nextTarget <= selectedLoan.plan.duration) {
                setTargetInstallment(nextTarget);
            } else {
                setTargetInstallment(null);
            }

            // Auto-mark today's task as completed
            const todayStr = new Date().toISOString().split("T")[0];
            await supabase
                .from("daily_tasks")
                .update({ status: "completed" })
                .eq("loan_id", selectedLoan.id)
                .eq("collector_id", user?.id)
                .eq("task_date", todayStr)
                .eq("status", "pending");

            // Check if this was the last payment
            const totalSegments = selectedLoan.plan.duration;
            if (totalSegments > 0 && (paidCount + 1) >= totalSegments) {
                await supabase
                    .from("loans")
                    .update({ status: "completed" })
                    .eq("id", selectedLoan.id);
                setSuccessMsg(`LOAN FULLY REPAID! Collected final installment.`);
            }
        }
        setLoading(false);
    };

    const generateReceipt = () => {
        if (!lastPayment || !borrower) return;
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("STRATOS MFI", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Payment Receipt", 105, 30, { align: "center" });

        const details = [
            ["Receipt ID", lastPayment.id.slice(0, 8)],
            ["Date", new Date().toLocaleDateString()],
            ["Borrower", borrower.full_name],
            ["NIC", borrower.nic_number],
            ["Loan ID", `#${selectedLoan.loan_number || selectedLoan.id.slice(0, 8)}`],
            ["Installment", `#${lastPayment.installment_number}`],
            ["Amount Paid", `LKR ${parseFloat(lastPayment.amount).toLocaleString()}`],
            ["Collector", "Agent"]
        ];

        autoTable(doc, {
            startY: 40,
            body: details,
            theme: 'plain',
            styles: { fontSize: 12, cellPadding: 3 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
        });

        doc.setFontSize(10);
        doc.text("Thank you for your payment.", 105, 120, { align: "center" });
        doc.text("System Generated Receipt", 105, 125, { align: "center" });
        doc.save(`receipt_${lastPayment.id.slice(0, 6)}.pdf`);
    };

    if (!borrower) return (
        <div className="p-4 flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-2">
                <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading borrower...</p>
            </div>
        </div>
    );

    const totalSegments = selectedLoan?.plan?.duration || 0;

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-4">
                <Link href="/collector">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h2 className="text-xl font-bold">{borrower.full_name}</h2>
                    <p className="text-xs text-muted-foreground">{borrower.address}</p>
                </div>
            </div>

            {!selectedLoan ? (
                <Card className="border-dashed border-2">
                    <CardContent className="p-12 text-center flex flex-col items-center justify-center">
                        <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground font-medium text-lg">No active loans found.</p>
                        <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-4 gap-2">
                            <RefreshCcw className="h-4 w-4" /> Force Refresh
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {/* Installment Grid */}
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="bg-secondary/20 pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Repayment Progress
                                </CardTitle>
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                    {paidCount} / {totalSegments}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-5 gap-3">
                                {Array.from({ length: totalSegments }).map((_, i) => {
                                    const instNum = i + 1;
                                    const payment = allPayments.find(p => p.installment_number === instNum);
                                    const isPaid = !!payment;
                                    
                                    const startDate = new Date(selectedLoan.start_date);
                                    const dueDate = selectedLoan.plan.installment_type === 'weekly' 
                                        ? addWeeks(startDate, instNum) 
                                        : addMonths(startDate, instNum);
                                    
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const due = new Date(dueDate);
                                    due.setHours(0, 0, 0, 0);
                                    
                                    const isLate = isBefore(due, today);
                                    const isSeverelyOverdue = isAfter(today, addDays(due, 3)) && !isPaid;
                                    
                                    let bgColor = "bg-secondary/40 border-secondary";
                                    let textColor = "text-muted-foreground";
                                    
                                    if (isPaid) {
                                        bgColor = "bg-emerald-500 border-emerald-600 grayscale-[0.2]";
                                        textColor = "text-white";
                                    } else if (isSeverelyOverdue) {
                                        bgColor = "bg-red-500 border-red-600 animate-pulse-subtle";
                                        textColor = "text-white";
                                    } else if (!isPaid && (isLate || isBefore(due, addDays(today, 1)))) {
                                        bgColor = "bg-amber-400 border-amber-500";
                                        textColor = "text-amber-950";
                                    }

                                    const isSelected = targetInstallment === instNum;

                                    return (
                                        <button
                                            key={instNum}
                                            disabled={isPaid}
                                            onClick={() => setTargetInstallment(instNum)}
                                            className={`
                                                relative flex flex-col items-center justify-center aspect-square rounded-xl border-2 text-[10px] font-bold transition-all active:scale-95
                                                ${bgColor} ${textColor}
                                                ${isSelected ? "ring-2 ring-primary ring-offset-2 scale-110 z-10 shadow-lg" : "hover:scale-105"}
                                                ${isPaid ? "cursor-default opacity-80" : "cursor-pointer shadow-sm"}
                                            `}
                                        >
                                            <span>{format(due, "dd/MM")}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex gap-4 justify-center mt-6 text-[9px] uppercase font-bold opacity-50 tracking-tighter">
                                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-px"/> Paid</div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-400 rounded-px"/> Due/Soon</div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-px"/> Overdue</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Collection UI */}
                    <div className="space-y-4">
                        {successMsg ? (
                            <Card className="border-emerald-200 bg-emerald-50/50">
                                <CardContent className="pt-6 text-center space-y-4">
                                    <div className="h-12 w-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                                    <h3 className="text-emerald-800 font-bold">{successMsg}</h3>
                                    <div className="flex flex-col gap-2">
                                        <Button onClick={generateReceipt} variant="outline" className="w-full gap-2 bg-white">
                                            <Printer className="h-4 w-4" /> Receipt
                                        </Button>
                                        {paidCount < totalSegments && (
                                            <Button onClick={() => setSuccessMsg(null)} variant="ghost" className="w-full">
                                                Collect Another
                                            </Button>
                                        )}
                                        <Link href="/collector" className="w-full">
                                            <Button variant="secondary" className="w-full">Back to List</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : targetInstallment ? (
                            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                                <Card className="bg-primary/5 border-primary/20 shadow-sm border-2">
                                    <CardHeader className="pb-2 text-center">
                                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                            Installment #{targetInstallment}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center space-y-1">
                                        <div className="text-4xl font-black text-primary tracking-tight">
                                            LKR {selectedLoan.plan?.installment_amount.toLocaleString()}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                            Due {format(selectedLoan.plan.installment_type === 'weekly' 
                                                ? addWeeks(new Date(selectedLoan.start_date), targetInstallment) 
                                                : addMonths(new Date(selectedLoan.start_date), targetInstallment), 'MMMM do')}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Button
                                    onClick={handlePayment}
                                    className="w-full h-16 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/30 transition-all hover:translate-y-[-2px] active:translate-y-[1px]"
                                    disabled={loading}
                                >
                                    {loading ? "Processing..." : `Confirm Payment`}
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-secondary/20 rounded-2xl border-2 border-dashed border-secondary">
                                <h3 className="font-bold text-muted-foreground">LOAN FULLY PAID</h3>
                                <Link href="/collector" className="mt-4 block">
                                    <Button variant="outline">Back to Borrowers</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
