"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MotionContainer } from "@/components/motion-container";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Check user role
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();

                if (profile?.role === 'collector') {
                    router.push("/collector");
                } else {
                    router.push("/dashboard");
                }
                router.refresh();
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center gradient-hero-dark px-4 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-light-blue/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-medium-blue/5 rounded-full blur-3xl" />
            </div>

            <MotionContainer className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-block mb-6">
                        <svg 
                            width="60" 
                            height="60" 
                            viewBox="0 0 100 100" 
                            className="mx-auto"
                        >
                            <line x1="20" y1="50" x2="80" y2="50" stroke="white" strokeWidth="8" strokeLinecap="round"/>
                            <line x1="50" y1="20" x2="50" y2="80" stroke="white" strokeWidth="8" strokeLinecap="round"/>
                            <line x1="30" y1="30" x2="70" y2="70" stroke="white" strokeWidth="8" strokeLinecap="round"/>
                            <line x1="70" y1="30" x2="30" y2="70" stroke="white" strokeWidth="8" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Stratos</h1>
                    <p className="text-white/70 text-sm font-light">
                        Sign in to your account
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-dark-strong rounded-3xl p-8 shadow-deep">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            {/* Email Field */}
                            <div>
                                <label 
                                    htmlFor="email" 
                                    className="block text-sm font-medium text-white mb-2"
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/50 shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-smooth backdrop-blur-sm"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <label 
                                    htmlFor="password" 
                                    className="block text-sm font-medium text-white mb-2"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/50 shadow-sm focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-smooth backdrop-blur-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-500/30 p-4 text-sm text-white">
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
                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "flex w-full justify-center items-center gap-2 rounded-full bg-white py-3.5 text-base font-semibold text-dark-navy shadow-medium hover:shadow-deep hover-scale transition-smooth",
                                loading && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {loading ? (
                                <>
                                    <svg 
                                        className="animate-spin h-5 w-5" 
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
                                    Signing in...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    {/* Footer Text */}
                    <p className="text-center text-xs text-white/60 mt-6 font-light">
                        Use your assigned credentials to access the system.
                    </p>
                </div>
            </MotionContainer>
        </div>
    );
}
