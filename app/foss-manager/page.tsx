"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { AdminAuthProvider, useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { Eye, EyeOff } from 'lucide-react';

function AdminLoginForm() {
    const router = useRouter();
    const { user, authLoading } = useAdminAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetMessage, setResetMessage] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);



    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.error || 'Authentication failed.');
                setLoading(false);
                return;
            }

            // Success — navigate to dashboard
            router.push('/foss-manager/dashboard');
            router.refresh();
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        setLoading(true);
        setError(null);
        setResetMessage(null);

        try {
            const response = await fetch('/api/admin/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setError(data.error || 'Unable to process the request. Please try again later.');
            } else {
                // This message is intentionally identical for unknown addresses.
                setResetMessage('If that address is authorised, a password-reset link has been sent. Check your inbox and spam folder.');
            }
        } catch {
            setError('Unable to process the request. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Show loading state during SSR / before mount / while checking session
    if (!mounted || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
                <div className="text-xl font-mono animate-pulse">Initializing...</div>
            </div>
        );
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4">
            <div
                className="w-full max-w-md rounded-2xl p-8 relative overflow-hidden"
                style={{
                    background: 'rgba(8,8,8,0.96)',
                    border: '1px solid rgba(0,230,118,0.1)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 0 60px rgba(0,230,118,0.05), 0 25px 60px rgba(0,0,0,0.6)',
                }}
            >
                {/* Top accent line */}
                <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(0,230,118,0.4), transparent)' }}
                />
                {/* Background glow */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,230,118,0.06) 0%, transparent 70%)' }}
                />

                {/* Header */}
                <div className="text-center mb-8 relative z-10">
                    <div
                        className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                        style={{
                            background: 'rgba(0,230,118,0.08)',
                            border: '1px solid rgba(0,230,118,0.15)',
                            boxShadow: '0 0 20px rgba(0,230,118,0.08)',
                        }}
                    >
                        <svg
                            className="w-6 h-6 text-[#00e676]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white font-mono mb-1">
                        Admin Access
                    </h1>
                    <p className="text-sm text-gray-500 font-mono">
                        <span className="text-[#00e676]/40">//</span> authorized personnel only
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                    <div>
                        <label htmlFor="admin-email" className="block text-xs font-semibold text-gray-300 font-mono uppercase tracking-widest mb-1.5">
                            Email Address
                        </label>
                        <input
                            id="admin-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@fosscev.org"
                            required
                            autoComplete="email"
                            suppressHydrationWarning
                            className="w-full px-4 py-3 rounded-xl text-base text-gray-100 placeholder-gray-600 font-mono focus:outline-none transition-all"
                            style={{
                                background: 'rgba(0,230,118,0.03)',
                                border: '1px solid rgba(0,230,118,0.08)',
                            }}
                            onFocus={e => {
                                e.target.style.border = '1px solid rgba(0,230,118,0.25)';
                                e.target.style.background = 'rgba(0,230,118,0.05)';
                            }}
                            onBlur={e => {
                                e.target.style.border = '1px solid rgba(0,230,118,0.08)';
                                e.target.style.background = 'rgba(0,230,118,0.03)';
                            }}
                        />
                    </div>

                    <div>
                        <label htmlFor="admin-password" className="block text-xs font-semibold text-gray-300 font-mono uppercase tracking-widest mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="admin-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                                suppressHydrationWarning
                                className="w-full px-4 py-3 pr-12 rounded-xl text-base text-gray-100 placeholder-gray-600 font-mono focus:outline-none transition-all"
                                style={{
                                    background: 'rgba(0,230,118,0.03)',
                                    border: '1px solid rgba(0,230,118,0.08)',
                                }}
                                onFocus={e => {
                                    e.target.style.border = '1px solid rgba(0,230,118,0.25)';
                                    e.target.style.background = 'rgba(0,230,118,0.05)';
                                }}
                                onBlur={e => {
                                    e.target.style.border = '1px solid rgba(0,230,118,0.08)';
                                    e.target.style.background = 'rgba(0,230,118,0.03)';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((visible) => !visible)}
                                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 transition-colors hover:text-[#00e676] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00e676] focus-visible:ring-inset rounded-r-xl"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                aria-pressed={showPassword}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                            </button>
                        </div>
                    </div>

                    <div className="-mt-2 flex justify-end">
                        <button
                            type="button"
                            onClick={handlePasswordReset}
                            disabled={loading || !email.trim()}
                            className="text-xs font-mono text-[#00e676]/80 transition-colors hover:text-[#00e676] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00e676] rounded"
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div
                            className="px-4 py-3 rounded-xl"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                            <p className="text-sm text-red-400 font-mono">{error}</p>
                        </div>
                    )}

                    {resetMessage && (
                        <div className="px-4 py-3 rounded-xl" role="status" style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)' }}>
                            <p className="text-sm text-[#00e676] font-mono">{resetMessage}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl text-sm font-semibold font-mono transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{
                            background: 'linear-gradient(135deg, rgba(0,230,118,0.15) 0%, rgba(0,168,84,0.1) 100%)',
                            color: '#00e676',
                            border: '1px solid rgba(0,230,118,0.25)',
                            boxShadow: '0 0 20px rgba(0,230,118,0.08)',
                        }}
                    >
                        {loading ? (
                            <>
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{
                                        border: '2px solid rgba(0,230,118,0.2)',
                                        borderTopColor: '#00e676',
                                        animation: 'spin 0.8s linear infinite',
                                    }}
                                />
                                Authenticating...
                            </>
                        ) : (
                            'Sign In →'
                        )}
                    </button>
                </form>

                {/* Security footer */}
                <div
                    className="mt-6 pt-4 relative z-10"
                    style={{ borderTop: '1px solid rgba(0,230,118,0.06)' }}
                >
                    <div className="flex items-start gap-2">
                        <svg className="w-3 h-3 text-[#00e676]/60 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <p className="text-xs text-gray-600 leading-relaxed font-mono">
                            Encrypted session · Admin whitelist · 15-min inactivity timeout
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <AdminAuthProvider>
            <AdminLoginForm />
        </AdminAuthProvider>
    );
}
