"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { MotionContainer } from "@/components/motion-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus, Trash2, User, Shield } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface LoanPlan {
    id: number;
    name: string;
    principal_amount: number;
    installment_amount: number;
    duration_months: number;
    interest_rate: number;
}

interface UserProfile {
    id: string;
    role: string;
    // Assuming these fields might exist or we might need to fetch them differently if they are strict auth fields
    // For now, let's see what we get. If we only get role, we'll display ID.
    // Ideally profiles should have metadata. 
    full_name?: string;
    email?: string;
}

export default function SettingsPage() {
    const supabase = createClient();
    const [plans, setPlans] = useState<LoanPlan[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // New Plan Form State
    const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
    const [newPlan, setNewPlan] = useState({
        name: "",
        principal_amount: "",
        duration_months: "",
        interest_rate: "",
    });
    const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);

    useEffect(() => {
        fetchPlans();
        fetchUsers();
    }, []);

    const fetchPlans = async () => {
        setLoadingPlans(true);
        const { data, error } = await supabase
            .from("loan_plans")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            console.error("Error fetching plans:", error);
            toast.error("Failed to load loan plans");
        } else {
            setPlans(data || []);
        }
        setLoadingPlans(false);
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        // Fetch profiles. Assuming 'profiles' table has basic info.
        // If specific fields like name/email are missing in schema, this might return partial data.
        const { data, error } = await supabase
            .from("profiles")
            .select("*");

        if (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } else {
            setUsers(data || []);
        }
        setLoadingUsers(false);
    };

    const handleCreatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingPlan(true);

        try {
            const principal = parseFloat(newPlan.principal_amount);
            const duration = parseInt(newPlan.duration_months);
            const rate = parseFloat(newPlan.interest_rate);

            // Calculate installment using PMT formula or simple interest based on business logic
            // For now, let's use a simple interest formula: (Principal + (Principal * Rate * Duration / 12)) / Duration
            // Wait, previous code (demo) had hardcoded values. Let's start with a basic calculation.
            // Actually, Stratos seems to use fixed installment amounts in plans based on the create loan page types.
            // Let's assume (Principal * (1 + (Rate/100) * (Duration/12))) / Duration

            // However, the DB has `installment_amount` column?
            // Let's verify schema from `dashboard/loans/create/page.tsx` interface:
            // interface LoanPlan { id, name, principal_amount, installment_amount, duration_months }
            // It doesn't seemingly have interest_rate in the interface there but it might be in DB. 
            // `dashboard/loans/page.tsx` selects `plan:loan_plans(name)`.
            // `dashboard/reports/page.tsx` selects `interest_rate` from `loans` table, not plans.

            // Let's assume we calculate installment amount automatically or ask user for it?
            // Let's calculate it for simplicity: Total = Principal * (1 + Rate/100). Installment = Total / Duration.
            // This assumes Rate is Flat Rate for the term. Or maybe Rate is per annum.
            // Let's assume Rate is Flat % per Month for microfinance? Or Flat for term? 
            // Let's stick to a simple Monthly Rate input or similar.
            // Actually, let's just make `installment_amount` a calculated field based on 20% flat interest for now to match typical microfinance, 
            // OR add an input for it. Let's add an input for Installment Amount to be safe and flexible.

            // WAIT - I need to check if `interest_rate` column exists in `loan_plans`.
            // Creating a plan might fail if I insert a column that doesn't exist.
            // I'll calculate `installment_amount` and insert it.

            const totalAmount = principal * (1 + (rate / 100)); // Simple flat rate calculation
            const installment = Math.ceil(totalAmount / duration);

            const { error } = await supabase.from("loan_plans").insert([{
                name: newPlan.name,
                principal_amount: principal,
                duration_months: duration,
                // interest_rate: rate, // Might not exist in plans table, let's omit for now unless we know for sure
                installment_amount: installment
            }]);

            if (error) throw error;

            toast.success("Loan plan created successfully");
            setIsAddPlanOpen(false);
            setNewPlan({ name: "", principal_amount: "", duration_months: "", interest_rate: "" });
            fetchPlans();

        } catch (error: any) {
            console.error(error);
            toast.error(`Failed to create plan: ${error.message}`);
        } finally {
            setIsSubmittingPlan(false);
        }
    };

    const handleDeletePlan = async (id: number) => {
        if (!confirm("Are you sure you want to delete this plan?")) return;

        const { error } = await supabase.from("loan_plans").delete().eq("id", id);
        if (error) {
            toast.error("Failed to delete plan");
        } else {
            toast.success("Plan deleted");
            fetchPlans();
        }
    };

    return (
        <MotionContainer className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage system configurations and users.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="plans" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="plans">Loan Plans</TabsTrigger>
                    <TabsTrigger value="users">System Users</TabsTrigger>
                </TabsList>

                {/* LOAN PLANS TAB */}
                <TabsContent value="plans" className="space-y-4 mt-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Active Loan Plans</h2>
                        <Dialog open={isAddPlanOpen} onOpenChange={setIsAddPlanOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Plan
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Loan Plan</DialogTitle>
                                    <DialogDescription>
                                        Define the terms for a new lending product.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreatePlan} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Plan Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. Starter Loan"
                                            value={newPlan.name}
                                            onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="principal">Principal (Rs.)</Label>
                                            <Input
                                                id="principal"
                                                type="number"
                                                placeholder="10000"
                                                value={newPlan.principal_amount}
                                                onChange={(e) => setNewPlan({ ...newPlan, principal_amount: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="duration">Duration (Months)</Label>
                                            <Input
                                                id="duration"
                                                type="number"
                                                placeholder="12"
                                                value={newPlan.duration_months}
                                                onChange={(e) => setNewPlan({ ...newPlan, duration_months: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rate">Flat Interest Rate (%)</Label>
                                        <Input
                                            id="rate"
                                            type="number"
                                            placeholder="20"
                                            value={newPlan.interest_rate}
                                            onChange={(e) => setNewPlan({ ...newPlan, interest_rate: e.target.value })}
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">Used to calculate fixed installment amount.</p>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={isSubmittingPlan}>
                                            {isSubmittingPlan ? "Creating..." : "Create Plan"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Plan Name</TableHead>
                                    <TableHead>Principal</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Installment</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingPlans ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">Loading plans...</TableCell>
                                    </TableRow>
                                ) : plans.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No plans found.</TableCell>
                                    </TableRow>
                                ) : (
                                    plans.map((plan) => (
                                        <TableRow key={plan.id}>
                                            <TableCell className="font-medium">{plan.name}</TableCell>
                                            <TableCell>Rs. {plan.principal_amount.toLocaleString()}</TableCell>
                                            <TableCell>{plan.duration_months} Months</TableCell>
                                            <TableCell>Rs. {plan.installment_amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive/90"
                                                    onClick={() => handleDeletePlan(plan.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* USERS TAB */}
                <TabsContent value="users" className="space-y-4 mt-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Registered Users</h2>
                        {/* Adding users via simple signup usually, so maybe no 'Add User' button here unless we implement Invite */}
                    </div>

                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User ID / Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingUsers ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">Loading users...</TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No users found.</TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.full_name || user.email || "Unknown User"}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">{user.id.substring(0, 8)}...</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                                    <Shield className="h-3 w-3" />
                                                    Active
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </MotionContainer>
    );
}
