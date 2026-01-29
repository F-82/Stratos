export function Header({ user }: { user: any }) {
    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-background/50 px-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20" />
                    <div className="text-sm">
                        <p className="font-medium">{user.email}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
