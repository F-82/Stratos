"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import Link from "next/link";

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
    const supabase = createClient();

    useEffect(() => {
        async function fetchLoans() {
            // Join queries in Supabase need explicit definitions or view logic, 
            // but for now we'll do a simple fetch and assume relation handling via ID or basic joins 
            // if policies allow component-level joins.
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
                // Transform data to match interface if needed, or rely on loose typing for now
                setLoans(data as any);
            }
            setLoading(false);
        }

        fetchLoans();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-primary">Loans</h2>
                <Link href="/dashboard/loans/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Issue New Loan
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Borrower</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Principal</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : loans.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No active loans found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            loans.map((loan) => (
                                <TableRow key={loan.id}>
                                    <TableCell className="font-medium">{loan.borrower?.full_name || 'Unknown'}</TableCell>
                                    <TableCell>{loan.plan?.name || 'Custom'}</TableCell>
                                    <TableCell>LKR {loan.principal_amount.toLocaleString()}</TableCell>
                                    <TableCell>{new Date(loan.start_date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${loan.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                                loan.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {loan.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
