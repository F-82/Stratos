"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Printer, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function BorrowerCollectionPage({ params }: PageProps) {
    // Unwrap params using React.use()
    const { id } = use(params);

    const [borrower, setBorrower] = useState<any>(null);
    const [loans, setLoans] = useState<any[]>([]);
    const [selectedLoan, setSelectedLoan] = useState<any>(null);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [lastPayment, setLastPayment] = useState<any>(null);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            const { data: bData } = await supabase.from("borrowers").select("*").eq("id", id).single();
            if (bData) setBorrower(bData);

            const { data: lData } = await supabase
                .from("loans")
                .select("*, plan:loan_plans(name, installment_amount)")
                .eq("borrower_id", id)
                .eq("status", "active");

            if (lData && lData.length > 0) {
                setLoans(lData);
                setSelectedLoan(lData[0]); // Default to first active loan
            }
        }
        fetchData();
    }, [id]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLoan || !amount) return;

        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase.from("payments").insert([{
            loan_id: selectedLoan.id,
            collector_id: user?.id, // Assumes user has a profile
            amount: parseFloat(amount),
            installment_number: 1, // Logic to calc installment number needed later
            notes: "Mobile collection"
        }]).select().single();

        if (error) {
            alert("Error: " + error.message);
        } else {
            setSuccessMsg(`Collected LKR ${amount} successfully!`);
            setLastPayment(data);
            setAmount("");
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
            ["Loan ID", selectedLoan.id.slice(0, 8)],
            ["Amount Paid", `LKR ${parseFloat(lastPayment.amount).toLocaleString()}`],
            ["Collector", "Agent"] // Should fetch collector name ideally
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

    if (!borrower) return <div className="p-4">Loading borrower...</div>;

    return (
        <div className="space-y-6">
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

            {!loans.length ? (
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No active loans found for this borrower.
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Loan ({selectedLoan.plan?.name})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">
                                LKR {selectedLoan.principal_amount.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Installment: LKR {selectedLoan.plan?.installment_amount.toLocaleString()}/mo
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Collect Payment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {successMsg ? (
                                <div className="text-center space-y-4 py-4">
                                    <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                        <span className="h-6 w-6 font-bold flex items-center justify-center">✓</span>
                                    </div>
                                    <h3 className="text-lg font-medium text-green-700">{successMsg}</h3>
                                    <div className="flex flex-col gap-2">
                                        <Button onClick={generateReceipt} variant="outline" className="w-full gap-2">
                                            <Printer className="h-4 w-4" /> Download Receipt
                                        </Button>
                                        <Button onClick={() => setSuccessMsg(null)} variant="ghost" className="w-full gap-2">
                                            <RefreshCcw className="h-4 w-4" /> New Payment
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handlePayment} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Amount (LKR)</Label>
                                        <Input
                                            type="number"
                                            placeholder="Enter amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="text-lg"
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                        {loading ? "Processing..." : "Confirm Payment"}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
