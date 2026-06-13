"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import Link from 'next/link';

type Mode = 'signin' | 'signup';
type Step = 'credentials' | 'otp';

export default function PicksSignInPage() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>('signin');
    const [step, setStep] = useState<Step>('credentials');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'signup') {
                const res = await fetch('/api/picks/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.error);
                    return;
                }

                setMessage('Check your email for a 6-digit verification code');
                setStep('otp');
            } else {
                // Sign in
                const res = await fetch('/api/picks/auth/signin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();

                if (!res.ok) {
                    // If user isn't verified yet, show OTP step
                    if (data.error?.includes('not confirmed') || data.error?.includes('Email not confirmed')) {
                        setMessage('Your email is not verified yet. Check your email for the verification code.');
                        setStep('otp');
                        return;
                    }
                    setError(data.error);
                    return;
                }

                // Success — set session via Supabase client
                const { supabase } = await import('@/lib/supabase');
                if (data.session) {
                    await supabase.auth.setSession({
                        access_token: data.session.access_token,
                        refresh_token: data.session.refresh_token,
                    });
                }

                router.push('/picks');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/picks/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token: otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }

            // Set session
            const { supabase } = await import('@/lib/supabase');
            if (data.session) {
                await supabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                });
            }

            router.push('/picks');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="pt-28 pb-20 px-4 min-h-screen flex items-start justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                {/* Back link */}
                <Link
                    href="/picks"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6"
                >
                    <ArrowLeft size={14} />
                    Back to Picks
                </Link>

                <div className="bg-[#0a0a0a]/90 border border-white/[0.08] rounded-2xl p-6 md:p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(216, 90, 48, 0.2), rgba(216, 90, 48, 0.05))',
                                border: '1px solid rgba(216, 90, 48, 0.2)',
                            }}>
                            {step === 'otp' ? (
                                <KeyRound size={22} className="text-[#D85A30]" />
                            ) : (
                                <ShieldCheck size={22} className="text-[#D85A30]" />
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-white font-display mb-1">
                            {step === 'otp' ? 'Verify Email' : mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {step === 'otp'
                                ? 'Enter the 6-digit code sent to your email'
                                : 'Join the FOSS CEV community'}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'credentials' ? (
                            <motion.form
                                key="credentials"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleCredentials}
                                className="space-y-4"
                            >
                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@cev.ac.in"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-600 mt-1">
                                        Accepts @cev.ac.in, @gmail.com, @outlook.com, @yahoo.com
                                    </p>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all"
                                        />
                                    </div>
                                    {mode === 'signup' && (
                                        <p className="text-[11px] text-gray-600 mt-1">Minimum 6 characters</p>
                                    )}
                                </div>

                                {error && (
                                    <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <p className="text-xs text-red-400">{error}</p>
                                    </div>
                                )}

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                                    style={{
                                        background: 'linear-gradient(135deg, #D85A30, #e06b3a)',
                                        color: '#fff',
                                        boxShadow: '0 4px 20px rgba(216, 90, 48, 0.2)',
                                    }}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                                        </span>
                                    ) : (
                                        mode === 'signup' ? 'Create Account & Send Code' : 'Sign In'
                                    )}
                                </motion.button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode(mode === 'signin' ? 'signup' : 'signin');
                                            setError(null);
                                        }}
                                        className="text-xs text-gray-500 hover:text-[#D85A30] transition-colors"
                                    >
                                        {mode === 'signin'
                                            ? "Don't have an account? Sign up"
                                            : 'Already have an account? Sign in'}
                                    </button>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleVerifyOtp}
                                className="space-y-4"
                            >
                                {message && (
                                    <div className="px-3 py-2 bg-[#D85A30]/10 border border-[#D85A30]/20 rounded-lg">
                                        <p className="text-xs text-[#D85A30]">{message}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        required
                                        maxLength={6}
                                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/8 rounded-lg text-center text-xl font-mono text-gray-200 tracking-[0.5em] placeholder-gray-700 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all"
                                        autoFocus
                                    />
                                    <p className="text-[11px] text-gray-600 mt-1.5">
                                        Sent to <span className="text-gray-400">{email}</span> · Code expires in 10 minutes
                                    </p>
                                </div>

                                {error && (
                                    <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <p className="text-xs text-red-400">{error}</p>
                                    </div>
                                )}

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    type="submit"
                                    disabled={loading || otp.length < 6}
                                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                                    style={{
                                        background: 'linear-gradient(135deg, #D85A30, #e06b3a)',
                                        color: '#fff',
                                        boxShadow: '0 4px 20px rgba(216, 90, 48, 0.2)',
                                    }}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Verifying...
                                        </span>
                                    ) : (
                                        'Verify & Enter'
                                    )}
                                </motion.button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep('credentials');
                                            setOtp('');
                                            setError(null);
                                            setMessage(null);
                                        }}
                                        className="text-xs text-gray-500 hover:text-[#D85A30] transition-colors"
                                    >
                                        ← Back to credentials
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Security note */}
                    <div className="mt-6 pt-4 border-t border-white/[0.06]">
                        <div className="flex items-start gap-2">
                            <ShieldCheck size={14} className="text-gray-600 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] text-gray-600 leading-relaxed">
                                Protected by Supabase Auth with PKCE flow, rate limiting, and encrypted sessions. Your password is never stored in plain text.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
