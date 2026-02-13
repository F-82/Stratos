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
import { Badge } from "@/components/ui/badge";
import { resetCollectors, resetBorrowers, resetLoans } from "@/app/actions/vault";
import { AlertTriangle, Trash2, RefreshCcw, HardDrive, ShieldAlert, Plus, User, Shield } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LoanPlan {
    id: string;
    name: string;
    principal_amount: number;
    duration_months: number;
    interest_rate: number;
    installment_amount: number;
}

interface UserProfile {
    id: string;
    full_name: string;
    email?: string;
    role: string;
    created_at: string;
}

export default function SettingsPage() {
    const supabase = createClient();

    // Loan Plans State
    const [plans, setPlans] = useState<LoanPlan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
    const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
    const [newPlan, setNewPlan] = useState({
        name: "",
        principal_amount: "",
        duration_months: "",
        interest_rate: ""
    });

    // Users State
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // Vault State
    const [isVaultOpen, setIsVaultOpen] = useState(false);
    const [vaultLoading, setVaultLoading] = useState(false);

    useEffect(() => {
        fetchPlans();
        fetchUsers();
    }, []);

    const fetchPlans = async () => {
        setLoadingPlans(true);
        const { data, error } = await supabase
            .from('loan_plans')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching plans:', error);
            toast.error("Failed to load loan plans");
        } else {
            setPlans(data || []);
        }
        setLoadingPlans(false);
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            // toast.error("Failed to load users");
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

            if (isNaN(principal) || isNaN(duration) || isNaN(rate)) {
                toast.error("Please enter valid numbers");
                setIsSubmittingPlan(false);
                return;
            }

            // Calculation: Simple Interest Flat Rate per Annum
            // Interest = Principal * (Rate / 100) * (Duration / 12)
            const interest = principal * (rate / 100) * (duration / 12);
            const totalAmount = principal + interest;
            const installment = Math.ceil(totalAmount / duration);

            const { error } = await supabase.from('loan_plans').insert([{
                name: newPlan.name,
                principal_amount: principal,
                duration_months: duration,
                interest_rate: rate,
                installment_amount: installment
            }]);

            if (error) throw error;

            toast.success("Loan plan created successfully");
            setIsAddPlanOpen(false);
            setNewPlan({ name: "", principal_amount: "", duration_months: "", interest_rate: "" });
            fetchPlans();
        } catch (error: any) {
            toast.error(error.message || "Failed to create plan");
        } finally {
            setIsSubmittingPlan(false);
        }
    };

    const handleDeletePlan = async (id: string) => {
        if (!confirm("Are you sure you want to delete this plan?")) return;

        const { error } = await supabase.from('loan_plans').delete().eq('id', id);
        if (error) {
            toast.error("Failed to delete plan");
        } else {
            toast.success("Plan deleted");
            fetchPlans();
        }
    };

    const handleVaultAction = async (actionType: 'collectors' | 'borrowers' | 'loans') => {
        setVaultLoading(true);
        try {
            let result;
            if (actionType === 'collectors') result = await resetCollectors();
            else if (actionType === 'borrowers') result = await resetBorrowers();
            else if (actionType === 'loans') result = await resetLoans();

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success(result?.message || "Action completed");
                // Refresh data
                fetchPlans();
                fetchUsers();
            }
        } catch (e) {
            toast.error("An error occurred");
        } finally {
            setVaultLoading(false);
            setIsVaultOpen(false);
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

                <Dialog open={isVaultOpen} onOpenChange={setIsVaultOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive" className="gap-2 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20">
                            <ShieldAlert className="h-4 w-4" />
                            Vault Access
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md border-red-500/20">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600">
                                <ShieldAlert className="h-5 w-5" />
                                System Vault (Danger Zone)
                            </DialogTitle>
                            <DialogDescription>
                                Perform destructive actions for testing purposes. These actions cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-red-900">Purge Collectors</h4>
                                    <p className="text-xs text-red-700">Delete all collector accounts.</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" disabled={vaultLoading}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Purge
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete ALL collector accounts and their profiles. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleVaultAction('collectors')} className="bg-red-600 hover:bg-red-700">
                                                Yes, delete collectors
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-orange-900">Purge Borrowers</h4>
                                    <p className="text-xs text-orange-700">Delete all borrower records.</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="bg-orange-500 hover:bg-orange-600 text-white" size="sm" disabled={vaultLoading}>
                                            <User className="h-4 w-4 mr-2" />
                                            Purge
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will delete ALL borrowers. Loans associated with them might technically remain orphaned if not cascaded, but we recommend resetting loans too.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleVaultAction('borrowers')} className="bg-orange-600 hover:bg-orange-700">
                                                Yes, delete borrowers
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-lg">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-blue-900">Reset Loans</h4>
                                    <p className="text-xs text-blue-700">Wipe all loans and payments.</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm" disabled={vaultLoading}>
                                            <RefreshCcw className="h-4 w-4 mr-2" />
                                            Reset
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Reset all loan data?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will delete ALL active loans and payment history. Financial data will be lost.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleVaultAction('loans')} className="bg-blue-600 hover:bg-blue-700">
                                                Yes, reset loans
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
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
