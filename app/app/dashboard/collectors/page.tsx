"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MotionContainer } from "@/components/motion-container";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, User, Shield, Briefcase, Phone, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { createUser } from "@/app/actions/create-user"; // Import Server Action

interface CollectorProfile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at?: string;
    // Add phone if available in schema, otherwise we might just store it in metadata or separate column
}

export default function CollectorsPage() {
    const supabase = createClient();
    const [collectors, setCollectors] = useState<CollectorProfile[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // We'll use native form action or explicit handler? Explicit handler gives more control over loading state/toasts easily.

    const router = useRouter(); // Add useRouter

    useEffect(() => {
        async function init() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            // Check role for access control
            let role = user?.user_metadata?.role;
            if (!role && user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                role = profile?.role;
            }

            if (role !== 'admin') {
                toast.error("Unauthorized access");
                router.push("/dashboard"); // Redirect to dashboard
                return;
            }

            fetchCollectors();
        }
        init();
    }, []);

    const fetchCollectors = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("role", "collector") // Filter by role
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching collectors:", error);
            toast.error("Failed to load collectors");
        } else {
            setCollectors(data || []);
        }
        setLoading(false);
    };

    const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await createUser(formData);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.message);
                setIsAddOpen(false);
                fetchCollectors(); // Refresh list
                // form reset happens automatically if we close/unmount or we can reset explicit
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MotionContainer className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Collectors</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your field collection team.
                    </p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-medium-blue hover:bg-medium-blue/90">
                            <Plus className="h-4 w-4" />
                            Add Collector
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Collector</DialogTitle>
                            <DialogDescription>
                                Create a new account for a field collector. They will use these credentials to log in.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" name="fullName" placeholder="John Doe" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" name="phone" placeholder="0771234567" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Collector</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">Loading collectors...</TableCell>
                            </TableRow>
                        ) : collectors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center flex-col items-center justify-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <Briefcase className="h-8 w-8 mb-2 opacity-50" />
                                        <p>No collectors found.</p>
                                        <p className="text-sm">Add one to get started.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            collectors.map((collector) => (
                                <TableRow key={collector.id}>
                                    <TableCell className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{collector.full_name || "Unknown"}</span>
                                            <Badge variant="secondary" className="w-fit text-[10px] h-5 px-1.5 mt-0.5">COLLECTOR</Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3.5 w-3.5" />
                                                {collector.email}
                                            </div>
                                            {/* Phone would go here if we fetch it */}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-500/10 px-2 py-1 rounded-full w-fit">
                                            <Shield className="h-3 w-3" />
                                            Active
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Edit</Button>
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
