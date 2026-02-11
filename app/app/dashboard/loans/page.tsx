"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, DollarSign, TrendingUp, CheckCircle, Search, Filter } from "lucide-react";
import Link from "next/link";
import { MotionContainer } from "@/components/motion-container";

interface Loan {
    id: string;
    borrower: { full_name: string };
    plan: { name: string };
    principal_amount: number;
    status: string;
    start_date: string;
    end_date: string;
}

export default function LoansPage() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const supabase = createClient();

    useEffect(() => {
        async function fetchLoans() {
            setLoading(true);
            const { data, error } = await supabase
                .from("loans")
                .select(`
          id,
          principal_amount,
          status,
          start_date,
          end_date,
          borrower:borrowers(full_name),
          plan:loan_plans(name)
        `)
                .order("created_at", { ascending: false });

            if (data) {
                setLoans(data as any);
            }
            setLoading(false);
        }

        fetchLoans();
    }, []);

    // Filter Logic
    const filteredLoans = loans.filter(loan => {
        const matchesSearch = loan.borrower?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Calculate stats based on filtered data? Or total? 
    // Usually stats card show TOTALS, table shows FILTERED. 
    // Let's keep stats on TOTAL for now as per dashboard convention.
    const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal_amount, 0);
    const activeLoans = loans.filter(l => l.status === 'active').length;
    const completedLoans = loans.filter(l => l.status === 'completed').length;

    return (
        <MotionContainer className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground">Loans</h2>
                    <p className="text-sm text-muted-foreground mt-2 font-normal">
                        Manage loan disbursements and tracking
                    </p>
                </div>
                <Link href="/dashboard/loans/create">
                    <Button className="rounded-full px-6 py-6 bg-gradient-to-r from-light-blue to-medium-blue hover:shadow-glow transition-smooth shadow-medium">
                        <Plus className="mr-2 h-5 w-5" strokeWidth={2.5} />
                        Issue New Loan
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft hover-lift transition-smooth">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                Total Principal
                            </p>
                            <p className="text-3xl font-bold text-foreground">Rs. {totalPrincipal.toLocaleString()}</p>
                        </div>
                        <div className="bg-gradient-to-br from-light-blue/30 to-medium-blue/10 p-3 rounded-xl">
                            <DollarSign className="w-6 h-6 text-medium-blue" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft hover-lift transition-smooth">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                Active Loans
                            </p>
                            <p className="text-3xl font-bold text-foreground">{activeLoans}</p>
                        </div>
                        <div className="bg-gradient-to-br from-medium-blue/30 to-deep-blue/10 p-3 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-deep-blue" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft hover-lift transition-smooth">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                Completed
                            </p>
                            <p className="text-3xl font-bold text-foreground">{completedLoans}</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 p-3 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search borrower..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="defaulted">Defaulted</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Loans Table */}
            <div className="rounded-2xl border border-border/50 bg-card shadow-soft overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/50 hover:bg-transparent">
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Borrower</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Principal</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                            <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <svg
                                            className="animate-spin h-5 w-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Loading loans...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : loans.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <DollarSign className="w-12 h-12 opacity-20" />
                                        <p className="font-medium">No loans found</p>
                                        <p className="text-sm">Issue your first loan to get started</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredLoans.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Search className="w-12 h-12 opacity-20" />
                                        <p className="font-medium">No matching loans</p>
                                        <p className="text-sm">Try adjusting your filters</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLoans.map((loan) => (
                                <TableRow key={loan.id} className="border-b border-border/30 hover:bg-secondary/50 transition-colors">
                                    <TableCell className="font-semibold text-foreground">
                                        {loan.borrower?.full_name || 'Unknown'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-medium">
                                        {loan.plan?.name || 'Custom'}
                                    </TableCell>
                                    <TableCell className="font-semibold text-foreground">
                                        Rs. {loan.principal_amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(loan.start_date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${loan.status === 'active'
                                            ? 'bg-medium-blue/10 text-medium-blue border border-medium-blue/20'
                                            : loan.status === 'completed'
                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                : 'bg-red-100 text-red-700 border border-red-200'
                                            }`}>
                                            {loan.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-xl hover:bg-secondary transition-smooth"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </MotionContainer>
    );
}
