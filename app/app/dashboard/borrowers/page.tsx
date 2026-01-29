"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import Link from "next/link";

interface Borrower {
    id: string;
    full_name: string;
    nic_number: string;
    phone: string;
    address: string;
    status: string;
}

export default function BorrowersPage() {
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchBorrowers() {
            const { data, error } = await supabase
                .from("borrowers")
                .select("*")
                .order("created_at", { ascending: false });

            if (data) setBorrowers(data);
            setLoading(false);
        }

        fetchBorrowers();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-primary">Borrowers</h2>
                <Link href="/dashboard/borrowers/add">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Borrower
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>NIC</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : borrowers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No borrowers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            borrowers.map((borrower) => (
                                <TableRow key={borrower.id}>
                                    <TableCell className="font-medium">{borrower.full_name}</TableCell>
                                    <TableCell>{borrower.nic_number}</TableCell>
                                    <TableCell>{borrower.phone}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${borrower.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {borrower.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            View
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
