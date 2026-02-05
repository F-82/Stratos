export function Header({ user }: { user: any }) {
    return (
        <header className="flex h-20 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl shadow-sm">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
            </div>
            
            <div className="flex items-center gap-4">
                {/* User Profile */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 shadow-soft">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan to-blue flex items-center justify-center text-white font-semibold text-sm">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-sm">
                        <p className="font-medium text-foreground">{user.email}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
