"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, ChevronRight, Search, User, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { MotionContainer } from "@/components/motion-container";

interface Borrower {
    id: string;
    full_name: string;
    phone: string;
    address: string;
    status: string;
}

export default function CollectorHomePage() {
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const [filteredBorrowers, setFilteredBorrowers] = useState<Borrower[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchBorrowers() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("borrowers")
                .select("*")
                .eq('status', 'active')
                .eq('collector_id', user.id);

            if (data) {
                setBorrowers(data);
                setFilteredBorrowers(data);
            }
            setLoading(false);
        }

        fetchBorrowers();
    }, []);

    useEffect(() => {
        const lower = search.toLowerCase();
        setFilteredBorrowers(
            borrowers.filter(b =>
                b.full_name.toLowerCase().includes(lower) ||
                b.phone.includes(lower)
            )
        );
    }, [search, borrowers]);

    return (
        <MotionContainer className="space-y-6">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Borrowers</h1>
                <p className="text-sm text-muted-foreground font-normal">
                    Select a borrower to record payment
                </p>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-light-blue/10 to-medium-blue/10 rounded-2xl border border-light-blue/20 p-6 shadow-soft">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-medium-blue uppercase tracking-wider mb-2">
                            Active Borrowers
                        </p>
                        <p className="text-4xl font-bold text-foreground">{borrowers.length}</p>
                        <p className="text-sm text-muted-foreground mt-1">Assigned to you</p>
                    </div>
                    <div className="bg-gradient-to-br from-light-blue/30 to-medium-blue/10 p-4 rounded-2xl">
                        <User className="w-8 h-8 text-medium-blue" strokeWidth={2} />
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    className="pl-12 h-14 rounded-2xl bg-card border-border/50 focus:border-medium-blue transition-smooth shadow-soft text-base"
                    placeholder="Search by name or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Borrowers List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <svg
                                className="animate-spin h-6 w-6"
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
                            <span className="font-medium">Loading borrowers...</span>
                        </div>
                    </div>
                ) : filteredBorrowers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <CreditCard className="w-16 h-16 opacity-20 mb-4" />
                        <p className="font-medium text-lg mb-1">No borrowers found</p>
                        <p className="text-sm">Try adjusting your search</p>
                    </div>
                ) : (
                    filteredBorrowers.map(borrower => (
                        <Link href={`/collector/borrower/${borrower.id}`} key={borrower.id}>
                            <Card className="hover:border-light-blue/40 transition-smooth shadow-soft hover-lift rounded-2xl border-border/50">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-light-blue to-medium-blue flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                                            {borrower.full_name.charAt(0).toUpperCase()}
                                        </div>

                                        {/* Info */}
                                        <div className="space-y-1.5">
                                            <h3 className="font-bold text-foreground text-lg">{borrower.full_name}</h3>
                                            <div className="flex items-center text-sm text-muted-foreground gap-1">
                                                <Phone className="h-4 w-4" strokeWidth={2} />
                                                <span className="font-medium">{borrower.phone}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-muted-foreground gap-1">
                                                <MapPin className="h-4 w-4" strokeWidth={2} />
                                                <span className="line-clamp-1">{borrower.address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0" strokeWidth={2} />
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </MotionContainer>
    );
}
