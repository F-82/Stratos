"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

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
            // In real scenario, filter by assigned_collector_id = user.id
            // For demo, fetch all
            const { data, error } = await supabase
                .from("borrowers")
                .select("*")
                .eq('status', 'active');

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
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    className="pl-9 bg-secondary border-none"
                    placeholder="Search borrowers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                {loading ? (
                    <p className="text-center text-muted-foreground text-sm py-8">Loading borrowers...</p>
                ) : filteredBorrowers.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8">No borrowers found.</p>
                ) : (
                    filteredBorrowers.map(borrower => (
                        <Link href={`/collector/borrower/${borrower.id}`} key={borrower.id}>
                            <Card className="hover:bg-accent/50 transition-colors">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold">{borrower.full_name}</h3>
                                        <div className="flex items-center text-xs text-muted-foreground gap-3">
                                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {borrower.phone}</span>
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground gap-1">
                                            <MapPin className="h-3 w-3" /> {borrower.address}
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
