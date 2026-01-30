"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [lastPayment, setLastPayment] = useState<any>(null); // Stores the payment object after collection
    const [paidCount, setPaidCount] = useState(0);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            const { data: bData } = await supabase.from("borrowers").select("*").eq("id", id).single();
            if (bData) setBorrower(bData);

            // Fetch loan with duration details
            const { data: lData } = await supabase
                .from("loans")
                .select("*, plan:loan_plans(name, installment_amount, duration_months)")
                .eq("borrower_id", id)
                .eq("status", "active");

            if (lData && lData.length > 0) {
                const activeLoan = lData[0];
                setLoans(lData);
                setSelectedLoan(activeLoan);

                // Fetch payments count for this loan to calculate progress
                const { count } = await supabase
                    .from("payments")
                    .select("*", { count: 'exact', head: true })
                    .eq("loan_id", activeLoan.id);

                setPaidCount(count || 0);
            }
        }
        fetchData();
    }, [id]);

    const handlePayment = async () => {
        if (!selectedLoan) return;

        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        const installmentAmount = selectedLoan.plan.installment_amount;
        // The installment we are collecting now is the next one
        const currentInstallmentNumber = paidCount + 1;

        const { data, error } = await supabase.from("payments").insert([{
            loan_id: selectedLoan.id,
            collector_id: user?.id,
            amount: installmentAmount,
            installment_number: currentInstallmentNumber,
            notes: "Mobile collection"
        }]).select().single();

        if (error) {
            alert("Error: " + error.message);
        } else {
            setSuccessMsg(`Collected Installment #${currentInstallmentNumber} successfully!`);
            setLastPayment(data);
            setPaidCount(prev => prev + 1); // Increment locally to update UI

            // Check if this was the last payment
            const totalSegments = selectedLoan.plan.duration_months;
            if (currentInstallmentNumber >= totalSegments) {
                const { error: updateError } = await supabase
                    .from("loans")
                    .update({ status: "completed" })
                    .eq("id", selectedLoan.id);

                if (updateError) {
                    console.error("Failed to update loan status:", updateError);
                    alert("Payment collected, but failed to mark loan as completed. Please contact admin.");
                } else {
                    setSuccessMsg(`LOAN FULLY REPAID! Collected final installment #${currentInstallmentNumber}.`);
                }
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
            ["Loan ID", selectedLoan.id.slice(0, 8)],
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

    if (!borrower) return <div className="p-4">Loading borrower...</div>;

    // --- Visualization Logic ---
    const totalSegments = selectedLoan?.plan?.duration_months || 12;
    // Calculate percentage based on paid count
    const progressPercentage = (paidCount / totalSegments) * 100;

    // SVG Geometry
    const size = 220;
    const center = size / 2;
    const radius = 85;
    const strokeWidth = 20;
    const circumference = 2 * Math.PI * radius;
    // Calculate strokeDashoffset: full circumference minus the length of the filled part
    const strokeDashoffset = circumference - ((progressPercentage / 100) * circumference);

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
                    {/* Progress Visualization */}
                    <div className="flex justify-center py-6">
                        <div className="relative flex items-center justify-center">
                            {/* Rotated so it starts at top (-90deg) */}
                            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                                {/* Background Ring (Grey) */}
                                <circle
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    fill="transparent"
                                    stroke="var(--secondary)" // Use theme variable
                                    strokeWidth={strokeWidth}
                                />
                                {/* Progress Ring (Primary Color) */}
                                <circle
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    fill="transparent"
                                    stroke="var(--primary)" // Use theme variable
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="butt" // 'butt' is better for segmented look with separators
                                />
                                {/* Separator Lines (to create segments) */}
                                {Array.from({ length: totalSegments }).map((_, i) => {
                                    const angle = (i * 360) / totalSegments;
                                    const rad = (angle * Math.PI) / 180;
                                    // Calculate line start/end to cut through the stroke width
                                    const x1 = center + (radius - strokeWidth / 2 - 2) * Math.cos(rad);
                                    const y1 = center + (radius - strokeWidth / 2 - 2) * Math.sin(rad);
                                    const x2 = center + (radius + strokeWidth / 2 + 2) * Math.cos(rad);
                                    const y2 = center + (radius + strokeWidth / 2 + 2) * Math.sin(rad);

                                    return (
                                        <line
                                            key={i}
                                            x1={x1}
                                            y1={y1}
                                            x2={x2}
                                            y2={y2}
                                            stroke="var(--background)" // Matches page bg to look like "gap"
                                            strokeWidth="3"
                                        />
                                    );
                                })}
                            </svg>
                            {/* Inner Text (Center) */}
                            <div className="absolute flex flex-col items-center">
                                <span className="text-4xl font-bold">{paidCount}</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">of {totalSegments} Paid</span>
                            </div>
                        </div>
                    </div>

                    {/* Hide Next Installment card if loan is fully paid */}
                    {paidCount < totalSegments && (
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader className="pb-2 text-center">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Next Installment (#{paidCount + 1})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="text-4xl font-bold text-primary">
                                    LKR {selectedLoan.plan?.installment_amount.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardContent className="pt-6">
                            {successMsg ? (
                                <div className="text-center space-y-4">
                                    <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                        <span className="h-8 w-8 font-bold flex items-center justify-center text-2xl">✓</span>
                                    </div>
                                    <h3 className="text-lg font-medium text-green-700">{successMsg}</h3>
                                    <div className="flex flex-col gap-2">
                                        <Button onClick={generateReceipt} variant="outline" className="w-full gap-2">
                                            <Printer className="h-4 w-4" /> Download Receipt
                                        </Button>

                                        {/* Only show "Collect Another" if loan is NOT finished */}
                                        {paidCount < totalSegments ? (
                                            <Button onClick={() => setSuccessMsg(null)} variant="ghost" className="w-full gap-2">
                                                <RefreshCcw className="h-4 w-4" /> Collect Another
                                            </Button>
                                        ) : (
                                            <Link href="/collector" className="w-full">
                                                <Button variant="default" className="w-full gap-2">
                                                    <ArrowLeft className="h-4 w-4" /> Return to List
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // SMART BUTTON (No Input Field)
                                <Button
                                    onClick={handlePayment}
                                    className="w-full h-16 text-lg font-semibold shadow-lg shadow-primary/20"
                                    size="lg"
                                    disabled={loading || paidCount >= totalSegments}
                                >
                                    {loading ? (
                                        "Processing..."
                                    ) : paidCount >= totalSegments ? (
                                        "Loan Fully Repaid"
                                    ) : (
                                        `Collect LKR ${selectedLoan.plan?.installment_amount.toLocaleString()}`
                                    )}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
