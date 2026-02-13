"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Phone, CreditCard, Search } from "lucide-react";
import Link from "next/link";
import { MotionContainer } from "@/components/motion-container";

interface Borrower {
    id: string;
    full_name: string;
    nic_number: string;
    phone: string;
    address: string;
    status: string;
    collector_id?: string;
}

export default function BorrowersPage() {
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const [collectors, setCollectors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
    const [selectedCollectorId, setSelectedCollectorId] = useState<string>("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchData();
    }, [debouncedQuery]);

    async function fetchData() {
        setLoading(true);

        // Fetch User Role
        const { data: { user } } = await supabase.auth.getUser();
        let role = user?.user_metadata?.role;

        if (!role && user) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            role = profile?.role;
        }

        // Fetch Borrowers
        let query = supabase
            .from("borrowers")
            .select("*")
            .order("created_at", { ascending: false });

        if (role === 'collector' && user) {
            query = query.eq('collector_id', user.id);
        }

        if (debouncedQuery) {
            query = query.or(`full_name.ilike.%${debouncedQuery}%,nic_number.ilike.%${debouncedQuery}%,phone.ilike.%${debouncedQuery}%`);
        }

        const { data: borrowersData, error: borrowersError } = await query;
        if (borrowersData) setBorrowers(borrowersData);

        // Fetch Collectors
        const { data: collectorsData } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("role", "collector");

        if (collectorsData) setCollectors(collectorsData);

        setLoading(false);
    }

    const handleAssignClick = (borrower: Borrower) => {
        setSelectedBorrower(borrower);
        setSelectedCollectorId(borrower.collector_id || "");
        setAssignDialogOpen(true);
    };

    const handleAssignSubmit = async () => {
        if (!selectedBorrower) return;

        const { error } = await supabase
            .from("borrowers")
            .update({ collector_id: selectedCollectorId || null }) // Allow unassigning
            .eq("id", selectedBorrower.id);

        if (error) {
            console.error("Error assigning collector:", error);
            // toast error
        } else {
            // toast success
            setAssignDialogOpen(false);
            fetchData(); // Refresh data
        }
    };

    // Helper to get collector name
    const getCollectorName = (id?: string) => {
        if (!id) return "Unassigned";
        const collector = collectors.find(c => c.id === id);
        return collector ? collector.full_name : "Unassigned";
    };

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

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by Name, NIC, or Phone..."
                    className="pl-10 max-w-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Stats Cards - Keeping existing ones */}
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

                {/* ... (Keep Active/Inactive cards same as before for brevity in replacement if possible, but replace_block needs full content if I am replacing the return) */}
                {/* I will include them to match the replacement target range */}
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
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
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
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
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
                            <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Collector</TableHead>
                            <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Loading borrowers...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : borrowers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        {debouncedQuery ? (
                                            <>
                                                <Search className="w-12 h-12 opacity-20" />
                                                <p className="font-medium">No matching borrowers</p>
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-12 h-12 opacity-20" />
                                                <p className="font-medium">No borrowers found</p>
                                            </>
                                        )}
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
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${borrower.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            : 'bg-red-100 text-red-700 border border-red-200'
                                            }`}>
                                            {borrower.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {getCollectorName(borrower.collector_id)}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleAssignClick(borrower)}
                                            >
                                                {/* Use an icon like 'UserPlus' or 'Edit' */}
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                            </Button>
                                        </div>
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

            {/* Assign Collector Dialog */}
            {assignDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-card w-full max-w-md rounded-xl p-6 shadow-lg border border-border">
                        <h3 className="text-lg font-bold mb-4">Assign Collector</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Assign specific collector to {selectedBorrower?.full_name}.
                        </p>
                        <div className="space-y-4">
                            <label className="text-sm font-medium">Select Collector</label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={selectedCollectorId}
                                onChange={(e) => setSelectedCollectorId(e.target.value)}
                            >
                                <option value="">-- Unassigned --</option>
                                {collectors.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.full_name}
                                    </option>
                                ))}
                            </select>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAssignSubmit}>Save Assignment</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MotionContainer>
    );
}
