"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Phone, CreditCard } from "lucide-react";
import Link from "next/link";
import { MotionContainer } from "@/components/motion-container";

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
        <MotionContainer className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground">Borrowers</h2>
                    <p className="text-sm text-muted-foreground mt-2 font-normal">
                        Manage borrower information and status
                    </p>
                </div>
                <Link href="/dashboard/borrowers/add">
                    <Button className="rounded-full px-6 py-6 bg-gradient-to-r from-light-blue to-medium-blue hover:shadow-glow transition-smooth shadow-medium">
                        <Plus className="mr-2 h-5 w-5" strokeWidth={2.5} /> 
                        Add Borrower
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft hover-lift transition-smooth">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                Total Borrowers
                            </p>
                            <p className="text-3xl font-bold text-foreground">{borrowers.length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-light-blue/30 to-medium-blue/10 p-3 rounded-xl">
                            <CreditCard className="w-6 h-6 text-medium-blue" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft hover-lift transition-smooth">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                Active
                            </p>
                            <p className="text-3xl font-bold text-foreground">
                                {borrowers.filter(b => b.status === 'active').length}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 p-3 rounded-xl">
                            <svg 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                className="text-emerald-600"
                            >
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft hover-lift transition-smooth">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                Inactive
                            </p>
                            <p className="text-3xl font-bold text-foreground">
                                {borrowers.filter(b => b.status !== 'active').length}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-red-100 to-red-50 p-3 rounded-xl">
                            <svg 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2"
                                className="text-red-600"
                            >
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Borrowers Table */}
            <div className="rounded-2xl border border-border/50 bg-card shadow-soft overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/50 hover:bg-transparent">
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">NIC</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                            <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
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
                                        Loading borrowers...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : borrowers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <CreditCard className="w-12 h-12 opacity-20" />
                                        <p className="font-medium">No borrowers found</p>
                                        <p className="text-sm">Add your first borrower to get started</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            borrowers.map((borrower) => (
                                <TableRow key={borrower.id} className="border-b border-border/30 hover:bg-secondary/50 transition-colors">
                                    <TableCell className="font-semibold text-foreground">{borrower.full_name}</TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-sm">{borrower.nic_number}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="w-4 h-4" />
                                            <span className="font-medium">{borrower.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                            borrower.status === 'active' 
                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                                : 'bg-red-100 text-red-700 border border-red-200'
                                        }`}>
                                            {borrower.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="rounded-xl hover:bg-secondary transition-smooth"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View
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
