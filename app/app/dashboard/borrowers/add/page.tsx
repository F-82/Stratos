"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddBorrowerPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            full_name: formData.get("full_name") as string,
            nic_number: formData.get("nic_number") as string,
            phone: formData.get("phone") as string,
            address: formData.get("address") as string,
            guarantor_name: formData.get("guarantor_name") as string,
            guarantor_phone: formData.get("guarantor_phone") as string,
            guarantor_nic: formData.get("guarantor_nic") as string,
            status: "active",
        };

        const { error: insertError } = await supabase
            .from("borrowers")
            .insert([data]);

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
        } else {
            router.push("/dashboard/borrowers");
            router.refresh();
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/borrowers">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight text-primary">Add Borrower</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Borrower Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <label htmlFor="full_name" className="text-sm font-medium">Full Name</label>
                                <Input id="full_name" name="full_name" required placeholder="e.g. John Doe" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label htmlFor="nic_number" className="text-sm font-medium">NIC Number</label>
                                    <Input id="nic_number" name="nic_number" required placeholder="e.g. 199012345678" />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                                    <Input id="phone" name="phone" required placeholder="e.g. 0771234567" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="address" className="text-sm font-medium">Address</label>
                                <Input id="address" name="address" required placeholder="Full residential address" />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border">
                            <h3 className="text-lg font-medium">Guarantor Details (Optional)</h3>
                            <div className="grid gap-2">
                                <label htmlFor="guarantor_name" className="text-sm font-medium">Guarantor Name</label>
                                <Input id="guarantor_name" name="guarantor_name" placeholder="Name of guarantor" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label htmlFor="guarantor_nic" className="text-sm font-medium">Guarantor NIC</label>
                                    <Input id="guarantor_nic" name="guarantor_nic" placeholder="Guarantor NIC" />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="guarantor_phone" className="text-sm font-medium">Guarantor Phone</label>
                                    <Input id="guarantor_phone" name="guarantor_phone" placeholder="Guarantor Phone" />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                                {loading ? "Saving..." : "Create Borrower"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
