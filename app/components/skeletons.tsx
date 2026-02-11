import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-32" />
                            </div>
                            <Skeleton className="h-10 w-10 rounded-xl" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                    </div>
                ))}
            </div>

            {/* Main Graph Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 p-6 shadow-soft">
                    <div className="flex justify-between mb-6">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                </div>
                <div className="space-y-6">
                    <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-soft h-full">
                        <Skeleton className="h-6 w-32 mb-6" />
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-24" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-20 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TableSkeleton() {
    return (
        <div className="rounded-2xl border border-border/50 bg-card shadow-soft overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-32 rounded-full" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );
}
