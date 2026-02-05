"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, CreditCard, Phone, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { MotionContainer } from "@/components/motion-container";

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
        <MotionContainer className="space-y-6 max-w-3xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/borrowers">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="rounded-xl hover:bg-secondary transition-smooth"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground">Add Borrower</h2>
                    <p className="text-sm text-muted-foreground mt-2 font-normal">
                        Create a new borrower profile
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <Card className="rounded-2xl border-border/50 shadow-soft">
                <CardHeader className="border-b border-border/50 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-light-blue/30 to-medium-blue/10 p-3 rounded-xl">
                            <User className="w-6 h-6 text-medium-blue" strokeWidth={2} />
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground">Borrower Information</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Information Section */}
                        <div className="space-y-5">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Personal Details
                            </h3>
                            
                            <div className="grid gap-2">
                                <label htmlFor="full_name" className="text-sm font-medium text-foreground">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <Input 
                                    id="full_name" 
                                    name="full_name" 
                                    required 
                                    placeholder="e.g. John Doe"
                                    className="rounded-xl border-border/50 focus:border-medium-blue transition-smooth h-12"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label htmlFor="nic_number" className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                                        NIC Number <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        id="nic_number" 
                                        name="nic_number" 
                                        required 
                                        placeholder="e.g. 199012345678"
                                        className="rounded-xl border-border/50 focus:border-medium-blue transition-smooth h-12"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        id="phone" 
                                        name="phone" 
                                        required 
                                        placeholder="e.g. 0771234567"
                                        className="rounded-xl border-border/50 focus:border-medium-blue transition-smooth h-12"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="address" className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <Input 
                                    id="address" 
                                    name="address" 
                                    required 
                                    placeholder="Full residential address"
                                    className="rounded-xl border-border/50 focus:border-medium-blue transition-smooth h-12"
                                />
                            </div>
                        </div>

                        {/* Guarantor Information Section */}
                        <div className="space-y-5 pt-6 border-t border-border/50">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Guarantor Details (Optional)
                            </h3>
                            
                            <div className="grid gap-2">
                                <label htmlFor="guarantor_name" className="text-sm font-medium text-foreground">
                                    Guarantor Name
                                </label>
                                <Input 
                                    id="guarantor_name" 
                                    name="guarantor_name" 
                                    placeholder="Name of guarantor"
                                    className="rounded-xl border-border/50 focus:border-medium-blue transition-smooth h-12"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label htmlFor="guarantor_nic" className="text-sm font-medium text-foreground">
                                        Guarantor NIC
                                    </label>
                                    <Input 
                                        id="guarantor_nic" 
                                        name="guarantor_nic" 
                                        placeholder="Guarantor NIC"
                                        className="rounded-xl border-border/50 focus:border-medium-blue transition-smooth h-12"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="guarantor_phone" className="text-sm font-medium text-foreground">
                                        Guarantor Phone
                                    </label>
                                    <Input 
                                        id="guarantor_phone" 
                                        name="guarantor_phone" 
                                        placeholder="Guarantor Phone"
                                        className="rounded-xl border-border/50 focus:border-medium-blue transition-smooth h-12"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/30 p-4 text-sm text-red-600">
                                <div className="flex items-center gap-2">
                                    <svg 
                                        width="16" 
                                        height="16" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2"
                                    >
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="12" y1="8" x2="12" y2="12"/>
                                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6 border-t border-border/50">
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="rounded-full px-8 py-6 bg-gradient-to-r from-light-blue to-medium-blue hover:shadow-glow transition-smooth shadow-medium w-full sm:w-auto"
                            >
                                {loading ? (
                                    <>
                                        <svg 
                                            className="animate-spin h-5 w-5 mr-2" 
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
                                        Saving...
                                    </>
                                ) : (
                                    "Create Borrower"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </MotionContainer>
    );
}
