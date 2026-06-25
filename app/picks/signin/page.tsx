"use client";

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { usePicksAuth } from '@/components/picks/PicksAuthProvider';

type Mode = 'signin' | 'signup';

const ALLOWED_EMAIL_DOMAINS = [
    'cev.ac.in',
    'gmail.com',
    'outlook.com',
    'yahoo.com',
    'hotmail.com',
];

function isAllowedEmailDomain(email: string) {
    const domain = email.split('@')[1]?.toLowerCase();
    return ALLOWED_EMAIL_DOMAINS.includes(domain);
}

function PicksSignInPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const modeParam = searchParams.get('mode');
    const { user, session } = usePicksAuth();
    
    // Redirect authenticated users immediately
    useEffect(() => {
        if (user) {
            const redirect = searchParams.get('redirect');
            if (redirect === 'write') {
                router.replace('/picks/write');
            } else {
                router.replace('/picks');
            }
        }
    }, [user, router, searchParams]);
    
    const [mode, setMode] = useState<Mode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (modeParam === 'signup') {
            setMode('signup');
        } else if (modeParam === 'signin') {
            setMode('signin');
        }
    }, [modeParam]);

    const handleCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'signup') {
                if (!isAllowedEmailDomain(email)) {
                    setError('Please use a valid email address (@cev.ac.in, @gmail.com, @outlook.com, @yahoo.com, or @hotmail.com)');
                    setLoading(false);
                    return;
                }

                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (signUpError) {
                    setError(signUpError.message);
                    setLoading(false);
                    return;
                }

                if (data?.session) {
                    // Redirect immediately using replace to avoid redirect loops
                    const redirectUrl = searchParams.get('redirect') === 'write' ? '/picks/write' : '/picks';
                    router.replace(redirectUrl);
                } else if (data?.user) {
                    setShowOtp(true);
                    setMessage('Sign up successful! Please enter the verification code (OTP) sent to your email.');
                    setError(null);
                } else {
                    setMessage('Sign up successful! Please check your email to confirm your account.');
                    setError(null);
                }
            } else {
                // Sign in
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) {
                    setError(signInError.message);
                    setLoading(false);
                    return;
                }

                // Redirect immediately using replace to avoid redirect loops
                const redirectUrl = searchParams.get('redirect') === 'write' ? '/picks/write' : '/picks';
                router.replace(redirectUrl);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'signup',
            });

            if (verifyError) {
                setError(verifyError.message);
                setLoading(false);
                return;
            }

            setMessage('Email verified successfully! Redirecting...');
            const redirectUrl = searchParams.get('redirect') === 'write' ? '/picks/write' : '/picks';
            router.replace(redirectUrl);
        } catch (err) {
            setError('Failed to verify OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (resendError) {
                setError(resendError.message);
                setLoading(false);
                return;
            }

            setMessage('Verification code (OTP) resent successfully! Please check your inbox.');
        } catch (err) {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        if (showOtp) {
            handleVerifyOtp(e);
        } else {
            handleCredentials(e);
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
                            <ShieldCheck size={22} className="text-[#D85A30]" />
                        </div>
                        <h1 className="text-2xl font-bold text-white font-display mb-1">
                            {showOtp ? 'Verify OTP' : mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {showOtp ? 'Confirm email code' : mode === 'signup' ? 'Join the FOSS CEV community' : 'Sign in to your account'}
                        </p>
                    </div>



                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        {showOtp ? (
                            <>
                                {/* Email Address (Disabled) */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                        <input
                                            type="email"
                                            value={email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/8 rounded-lg text-sm text-gray-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* OTP Code Input */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                        Verification Code (OTP)
                                    </label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="123456"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-600 mt-1">
                                        Enter the verification code sent to your email.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
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
                                            placeholder="name@gmail.com"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-600 mt-1">
                                        Accepts @gmail.com, @outlook.com, @yahoo.com, @hotmail.com, and approved domains
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
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all"
                                        />
                                    </div>
                                    {mode === 'signup' && (
                                        <p className="text-[11px] text-gray-600 mt-1">Minimum 6 characters</p>
                                    )}
                                </div>
                            </>
                        )}

                        {error && (
                            <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-xs text-red-400">{error}</p>
                            </div>
                        )}

                        {message && (
                            <div className="px-3 py-2 bg-[#D85A30]/10 border border-[#D85A30]/20 rounded-lg">
                                <p className="text-xs text-[#D85A30]">{message}</p>
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
                                    {showOtp ? 'Verifying...' : mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                                </span>
                            ) : (
                                showOtp ? 'Verify Code' : mode === 'signup' ? 'Create Account' : 'Sign In'
                            )}
                        </motion.button>

                        <div className="text-center">
                            {showOtp ? (
                                <div className="flex flex-col gap-2.5 items-center">
                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={handleResendOtp}
                                        className="text-xs text-[#D85A30] hover:underline disabled:opacity-50 font-medium"
                                    >
                                        Resend OTP Code
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowOtp(false);
                                            setError(null);
                                            setMessage(null);
                                        }}
                                        className="text-xs text-gray-500 hover:text-[#D85A30] transition-colors"
                                    >
                                        Back to Sign Up
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode(mode === 'signin' ? 'signup' : 'signin');
                                        setError(null);
                                        setMessage(null);
                                    }}
                                    className="text-xs text-gray-500 hover:text-[#D85A30] transition-colors"
                                >
                                    {mode === 'signin'
                                        ? "Don't have an account? Sign up"
                                        : 'Already have an account? Sign in'}
                                </button>
                            )}
                        </div>
                    </form>

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

export default function PicksSignInPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-[#D85A30] border-t-white rounded-full animate-spin" />
            </div>
        }>
            <PicksSignInPageContent />
        </Suspense>
    );
}
