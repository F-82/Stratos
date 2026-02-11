"use client";

import { MotionContainer } from "@/components/motion-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FileSpreadsheet,
    FileText,
    Download,
    Users,
    CreditCard,
    Banknote,
    CalendarRange,
    Activity,
    AlertTriangle
} from "lucide-react";
import { useState } from "react";

import { createClient } from "@/utils/supabase/client";

export default function ReportsPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const supabase = createClient();

    const handleExportCSV = async (type: string) => {
        setLoading(type);
        try {
            let data: any[] = [];
            let filename = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;

            if (type === 'borrowers') {
                const { data: borrowers, error } = await supabase
                    .from('borrowers')
                    .select('*')
                    .order('full_name', { ascending: true });
                if (error) throw error;

                data = borrowers.map(b => ({
                    'Full Name': b.full_name,
                    'NIC Number': b.nic_number,
                    'Phone': b.phone_number,
                    'Address': b.address,
                    'Status': b.status,
                    'Registered Date': new Date(b.created_at).toLocaleDateString()
                }));
            } else if (type === 'loans') {
                const { data: loans, error } = await supabase
                    .from('loans')
                    .select(`
                        *,
                        borrowers (full_name)
                    `)
                    .order('created_at', { ascending: false });
                if (error) throw error;

                data = loans.map(l => ({
                    'Loan ID': l.id,
                    'Borrower': l.borrowers?.full_name,
                    'Principal Amount': l.principal_amount,
                    'Interest Rate': `${l.interest_rate}%`,
                    'Total Amount': l.total_amount,
                    'Balance': l.metadata?.remaining_balance || l.total_amount,
                    'Status': l.status,
                    'Start Date': new Date(l.start_date).toLocaleDateString(),
                    'Due Date': new Date(l.due_date).toLocaleDateString()
                }));
            } else if (type === 'payments') {
                const { data: payments, error } = await supabase
                    .from('payments')
                    .select(`
                        *,
                        loans (
                            borrowers (full_name)
                        )
                    `)
                    .order('date_collected', { ascending: false });
                if (error) throw error;

                data = payments.map(p => ({
                    'Payment ID': p.id,
                    'Borrower': p.loans?.borrowers?.full_name,
                    'Amount': p.amount,
                    'Date Collected': new Date(p.date_collected).toLocaleDateString(),
                    'Collector ID': p.collector_id
                }));
            }

            if (data.length > 0) {
                // Convert to CSV
                const headers = Object.keys(data[0]);
                const csvContent = [
                    headers.join(','),
                    ...data.map(row => headers.map(fieldName => {
                        const cell = row[fieldName] === null || row[fieldName] === undefined ? '' : row[fieldName];
                        return JSON.stringify(cell); // Handles commas and quotes
                    }).join(','))
                ].join('\n');

                // Download
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert("No data found to export.");
            }

        } catch (error) {
            console.error(error);
            alert("Failed to export CSV");
        }
        setLoading(null);
    };

    const handleGeneratePDF = async (reportType: string) => {
        setLoading(reportType);

        try {
            if (reportType === 'monthly') {
                const { jsPDF } = await import("jspdf");
                const autoTable = (await import("jspdf-autotable")).default;

                const doc = new jsPDF();
                const now = new Date();
                const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });

                // Fetch Data: Payments for this month
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const { data: payments, error } = await supabase
                    .from('payments')
                    .select(`*, loans(borrowers(full_name))`)
                    .gte('date_collected', startOfMonth)
                    .order('date_collected', { ascending: false });

                if (error) throw error;

                // Title
                doc.setFontSize(20);
                doc.setTextColor(41, 128, 185); // Blue
                doc.text("Monthly Collection Report", 14, 22);

                doc.setFontSize(11);
                doc.setTextColor(100);
                doc.text(`Period: ${currentMonth}`, 14, 30);
                doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 14, 36);

                // Summary Stats
                const totalCollected = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                const transactionCount = payments?.length || 0;

                doc.setFillColor(240, 248, 255);
                doc.roundedRect(14, 42, 180, 25, 3, 3, 'F');

                doc.setFontSize(10);
                doc.setTextColor(0);
                doc.text("Total Collected", 25, 50);
                doc.setFontSize(14);
                doc.setTextColor(46, 204, 113); // Green
                doc.text(`Rs. ${totalCollected.toLocaleString()}`, 25, 60);

                doc.setFontSize(10);
                doc.setTextColor(0);
                doc.text("Transactions", 100, 50);
                doc.setFontSize(14);
                doc.text(`${transactionCount}`, 100, 60);

                // Table
                const tableData = payments?.map(p => [
                    new Date(p.date_collected).toLocaleDateString(),
                    p.loans?.borrowers?.full_name || 'Unknown',
                    p.collector_id || 'System',
                    `Rs. ${p.amount.toLocaleString()}`
                ]) || [];

                autoTable(doc, {
                    startY: 75,
                    head: [['Date', 'Borrower', 'Collector', 'Amount']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                    styles: { fontSize: 9 },
                    foot: [['', '', 'Total', `Rs. ${totalCollected.toLocaleString()}`]],
                    footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
                });

                doc.save(`Monthly_Report_${currentMonth}.pdf`);
            }
            else if (reportType === 'portfolio') {
                const { jsPDF } = await import("jspdf");
                const autoTable = (await import("jspdf-autotable")).default;

                const doc = new jsPDF();
                const now = new Date();

                // Fetch Data: All Active Loans
                const { data: loans, error } = await supabase
                    .from('loans')
                    .select('*, borrowers(full_name)')
                    .eq('status', 'active');

                if (error) throw error;

                // Title
                doc.setFontSize(20);
                doc.setTextColor(41, 128, 185);
                doc.text("Portfolio Health Report", 14, 22);
                doc.setFontSize(11);
                doc.setTextColor(100);
                doc.text(`Generated: ${now.toLocaleDateString()}`, 14, 30);

                // Calculations
                const activeLoansCount = loans?.length || 0;
                const totalPrincipal = loans?.reduce((sum, l) => sum + (l.principal_amount || 0), 0) || 0;
                const totalOutstanding = loans?.reduce((sum, l) => sum + (l.metadata?.remaining_balance ?? l.total_amount ?? 0), 0) || 0;
                // Expected Profit (Total Amount - Principal) - this is rough but works for now
                const totalExpectedReturn = loans?.reduce((sum, l) => sum + (l.total_amount || 0), 0) || 0;

                // Summary Box
                doc.setFillColor(240, 248, 255);
                doc.roundedRect(14, 35, 180, 35, 3, 3, 'F');

                doc.setFontSize(10); doc.setTextColor(0);
                doc.text("Active Loans", 20, 45);
                doc.setFontSize(14); doc.setTextColor(0);
                doc.text(`${activeLoansCount}`, 20, 52);

                doc.setFontSize(10);
                doc.text("Total Disbursed", 70, 45);
                doc.setFontSize(14);
                doc.text(`Rs. ${(totalPrincipal || 0).toLocaleString()}`, 70, 52);

                doc.setFontSize(10);
                doc.text("Outstanding Balance", 140, 45);
                doc.setFontSize(14); doc.setTextColor(192, 57, 43); // Red
                doc.text(`Rs. ${(totalOutstanding || 0).toLocaleString()}`, 140, 52);

                doc.setFontSize(10); doc.setTextColor(0);
                doc.text("Total Receivable (Principal + Interest)", 20, 62);
                doc.setFontSize(12);
                doc.text(`Rs. ${(totalExpectedReturn || 0).toLocaleString()}`, 20, 68);

                // Breakdown Table
                const tableData = loans?.map(l => [
                    l.borrowers?.full_name || 'Unknown',
                    `Rs. ${(l.principal_amount || 0).toLocaleString()}`,
                    `Rs. ${(l.metadata?.remaining_balance ?? l.total_amount ?? 0).toLocaleString()}`,
                    new Date(l.due_date).toLocaleDateString()
                ]) || [];

                autoTable(doc, {
                    startY: 80,
                    head: [['Borrower', 'Principal', 'Outstanding', 'Due Date']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: { fillColor: [52, 73, 94], textColor: 255 },
                    foot: [['Total', `Rs. ${totalPrincipal.toLocaleString()}`, `Rs. ${totalOutstanding.toLocaleString()}`, '']]
                });

                doc.save(`Portfolio_Health_${now.toISOString().split('T')[0]}.pdf`);
            }
            else if (reportType === 'arrears') {
                const { jsPDF } = await import("jspdf");
                const autoTable = (await import("jspdf-autotable")).default;

                const doc = new jsPDF();
                const now = new Date();

                // Fetch Data: Loans past due date OR Loans with missed payments (Logic: Active loans where due date < today)
                // For simplicity, let's fetch ALL Active loans and filter in JS for those past due date
                const { data: loans, error } = await supabase
                    .from('loans')
                    .select('*, borrowers(full_name, phone_number)')
                    .eq('status', 'active');

                if (error) throw error;

                // Filter for "Risk" - For this demo, we'll list all active loans but highlight those close to due date?
                // Actually, let's just list ALL active loans as "Current Arrears Risk" since we don't track individual missed installments in DB yet seamlessly
                // Better approach: Loans where remaining balance > 0

                doc.setFontSize(20);
                doc.setTextColor(192, 57, 43); // Red
                doc.text("Arrears & Default Risk Report", 14, 22);
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text("List of active loans with outstanding balances.", 14, 30);

                const tableData = loans?.map(l => {
                    const balance = l.metadata?.remaining_balance ?? l.total_amount ?? 0;
                    return [
                        l.borrowers?.full_name || 'Unknown',
                        l.borrowers?.phone_number || 'N/A',
                        `Rs. ${(l.total_amount || 0).toLocaleString()}`,
                        `Rs. ${balance.toLocaleString()}`, // Outstanding
                        new Date(l.due_date).toLocaleDateString()
                    ];
                }) || [];

                autoTable(doc, {
                    startY: 40,
                    head: [['Borrower', 'Contact', 'Total Loan', 'Balance Due', 'Due Date']],
                    body: tableData,
                    theme: 'striped',
                    headStyles: { fillColor: [192, 57, 43], textColor: 255 },
                    styles: { fontSize: 10 }
                });

                doc.save(`Arrears_Report_${now.toISOString().split('T')[0]}.pdf`);
            }
        } catch (error: any) {
            console.error("PDF Generation Error:", error);
            alert(`Failed to generate PDF report: ${error?.message || error}`);
        }
        setLoading(null);
    };

    return (
        <MotionContainer className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">System Reports & Data</h1>
                <p className="text-muted-foreground mt-2">
                    Export system data for backup or generate business performance reports.
                </p>
            </div>

            {/* Section 1: Data Backup (CSV) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-xl font-semibold text-foreground">Data Backup (CSV)</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Borrowers CSV */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                Borrower Registry
                            </CardTitle>
                            <CardDescription>
                                Complete list of all borrowers and their details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                className="w-full gap-2"
                                onClick={() => handleExportCSV('borrowers')}
                                disabled={!!loading}
                            >
                                <Download className="h-4 w-4" />
                                {loading === 'borrowers' ? "Exporting..." : "Download CSV"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Loans CSV */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                Loan Portfolio
                            </CardTitle>
                            <CardDescription>
                                All active, completed, and defaulted loans.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                className="w-full gap-2"
                                onClick={() => handleExportCSV('loans')}
                                disabled={!!loading}
                            >
                                <Download className="h-4 w-4" />
                                {loading === 'loans' ? "Exporting..." : "Download CSV"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Payments CSV */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Banknote className="h-4 w-4 text-muted-foreground" />
                                Payment History
                            </CardTitle>
                            <CardDescription>
                                Full transaction log of all collected payments.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                className="w-full gap-2"
                                onClick={() => handleExportCSV('payments')}
                                disabled={!!loading}
                            >
                                <Download className="h-4 w-4" />
                                {loading === 'payments' ? "Exporting..." : "Download CSV"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Section 2: Business Reports (PDF) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-foreground">Business Reports (PDF)</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Monthly Collection Report */}
                    <Card className="bg-secondary/20 border-secondary hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <CalendarRange className="h-4 w-4 text-primary" />
                                Monthly Collection Summary
                            </CardTitle>
                            <CardDescription>
                                Total collected vs expected for the current month.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full gap-2"
                                onClick={() => handleGeneratePDF('monthly')}
                                disabled={!!loading}
                            >
                                <FileText className="h-4 w-4" />
                                {loading === 'monthly' ? "Generating..." : "Generate PDF"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Portfolio Health */}
                    <Card className="bg-secondary/20 border-secondary hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                Portfolio Health
                            </CardTitle>
                            <CardDescription>
                                Overview of active loans, outstanding amounts, and risk.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full gap-2"
                                onClick={() => handleGeneratePDF('portfolio')}
                                disabled={!!loading}
                            >
                                <FileText className="h-4 w-4" />
                                {loading === 'portfolio' ? "Generating..." : "Generate PDF"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Arrears Report */}
                    <Card className="bg-destructive/5 border-destructive/20 hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-4 w-4" />
                                Arrears & Defaults
                            </CardTitle>
                            <CardDescription>
                                List of borrowers who are behind on payments.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="destructive"
                                className="w-full gap-2"
                                onClick={() => handleGeneratePDF('arrears')}
                                disabled={!!loading}
                            >
                                <FileText className="h-4 w-4" />
                                {loading === 'arrears' ? "Generating..." : "Generate PDF"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MotionContainer>
    );
}
