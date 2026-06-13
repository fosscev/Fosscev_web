"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, ShieldCheck, KeyRound, Terminal } from 'lucide-react';
import Link from 'next/link';

type Mode = 'signin' | 'signup';
type Step = 'credentials' | 'otp';

export default function PicksSignInPage() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>('signin');
    const [step, setStep] = useState<Step>('credentials');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
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
                    body: JSON.stringify({ email, password, username }),
                });
                const data = await res.json();
                if (!res.ok) { setError(data.error); return; }
                setMessage('Check your email for a 6-digit verification code');
                setStep('otp');
            } else {
                const res = await fetch('/api/picks/auth/signin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const data = await res.json();
                if (!res.ok) {
                    if (data.error?.includes('not confirmed') || data.error?.includes('Email not confirmed')) {
                        setMessage('Your email is not verified yet. Check your email for the verification code.');
                        setStep('otp');
                        return;
                    }
                    setError(data.error);
                    return;
                }
                const { supabase } = await import('@/lib/supabase');
                if (data.session) {
                    supabase.auth.setSession({
                        access_token: data.session.access_token,
                        refresh_token: data.session.refresh_token,
                    }).catch(console.error);
                }
                router.push('/picks');
            }
        } catch (err) {
            console.error('Login error:', err);
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
            if (!res.ok) { setError(data.error); return; }

            const { supabase } = await import('@/lib/supabase');
            if (data.session) {
                supabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                }).catch(console.error);
            }
            router.push('/picks');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        background: 'rgba(0,230,118,0.03)',
        border: '1px solid rgba(0,230,118,0.08)',
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
                    className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#00e676] transition-colors mb-6 font-mono group"
                >
                    <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
                    cd ../picks
                </Link>

                {/* Card */}
                <div
                    className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
                    style={{
                        background: 'rgba(8,8,8,0.96)',
                        border: '1px solid rgba(0,230,118,0.1)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 0 60px rgba(0,230,118,0.05), 0 25px 60px rgba(0,0,0,0.6)',
                    }}
                >
                    {/* Top green line */}
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
                            className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                            style={{
                                background: 'rgba(0,230,118,0.08)',
                                border: '1px solid rgba(0,230,118,0.15)',
                                boxShadow: '0 0 20px rgba(0,230,118,0.08)',
                            }}
                        >
                            {step === 'otp' ? (
                                <KeyRound size={20} className="text-[#00e676]" />
                            ) : (
                                <Terminal size={20} className="text-[#00e676]" />
                            )}
                        </div>

                        <h1 className="text-xl font-bold text-white font-mono mb-1">
                            {step === 'otp' ? 'Verify Email' : mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                        </h1>
                        <p className="text-xs text-gray-600 font-mono">
                            <span className="text-[#00e676]/40">//</span>{' '}
                            {step === 'otp'
                                ? 'enter the 6-digit code sent to your email'
                                : 'join the FOSS CEV community'}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'credentials' ? (
                            <motion.form
                                key="credentials"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 16 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleCredentials}
                                className="space-y-4 relative z-10"
                            >
                                {/* Email */}
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-600 font-mono uppercase tracking-widest mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@cev.ac.in"
                                            required
                                            suppressHydrationWarning
                                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-300 placeholder-gray-700 font-mono focus:outline-none transition-all"
                                            style={inputStyle}
                                            onFocus={e => {
                                                (e.target as HTMLElement).style.border = '1px solid rgba(0,230,118,0.25)';
                                                (e.target as HTMLElement).style.background = 'rgba(0,230,118,0.05)';
                                            }}
                                            onBlur={e => {
                                                (e.target as HTMLElement).style.border = '1px solid rgba(0,230,118,0.08)';
                                                (e.target as HTMLElement).style.background = 'rgba(0,230,118,0.03)';
                                            }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-700 font-mono mt-1">
                                        @cev.ac.in · @gmail.com · @outlook.com · @yahoo.com
                                    </p>
                                </div>

                                {/* Username (Signup Only) */}
                                {mode === 'signup' && (
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-600 font-mono uppercase tracking-widest mb-1.5">
                                            Username (Optional)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-mono">@</span>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                placeholder="your_handle"
                                                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-300 placeholder-gray-700 font-mono focus:outline-none transition-all"
                                                style={inputStyle}
                                                onFocus={e => {
                                                    (e.target as HTMLElement).style.border = '1px solid rgba(0,230,118,0.25)';
                                                    (e.target as HTMLElement).style.background = 'rgba(0,230,118,0.05)';
                                                }}
                                                onBlur={e => {
                                                    (e.target as HTMLElement).style.border = '1px solid rgba(0,230,118,0.08)';
                                                    (e.target as HTMLElement).style.background = 'rgba(0,230,118,0.03)';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Password */}
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-600 font-mono uppercase tracking-widest mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            suppressHydrationWarning
                                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-300 placeholder-gray-700 font-mono focus:outline-none transition-all"
                                            style={inputStyle}
                                            onFocus={e => {
                                                (e.target as HTMLElement).style.border = '1px solid rgba(0,230,118,0.25)';
                                                (e.target as HTMLElement).style.background = 'rgba(0,230,118,0.05)';
                                            }}
                                            onBlur={e => {
                                                (e.target as HTMLElement).style.border = '1px solid rgba(0,230,118,0.08)';
                                                (e.target as HTMLElement).style.background = 'rgba(0,230,118,0.03)';
                                            }}
                                        />
                                    </div>
                                    {mode === 'signup' && (
                                        <p className="text-[10px] text-gray-700 font-mono mt-1">Minimum 6 characters</p>
                                    )}
                                </div>

                                {error && (
                                    <div
                                        className="px-3 py-2.5 rounded-xl"
                                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                                    >
                                        <p className="text-xs text-red-400 font-mono">{error}</p>
                                    </div>
                                )}

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 rounded-xl text-sm font-semibold font-mono transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
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
                                                className="w-3.5 h-3.5 rounded-full"
                                                style={{
                                                    border: '2px solid rgba(0,230,118,0.2)',
                                                    borderTopColor: '#00e676',
                                                    animation: 'spin 0.8s linear infinite',
                                                }}
                                            />
                                            {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                                        </>
                                    ) : (
                                        mode === 'signup' ? 'Create Account & Send Code' : 'Sign In →'
                                    )}
                                </motion.button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
                                        className="text-xs text-gray-600 font-mono transition-colors hover:text-[#00e676]"
                                    >
                                        {mode === 'signin'
                                            ? "Don't have an account? Sign up →"
                                            : '← Already have an account? Sign in'}
                                    </button>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="otp"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleVerifyOtp}
                                className="space-y-4 relative z-10"
                            >
                                {message && (
                                    <div
                                        className="px-3 py-2.5 rounded-xl"
                                        style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.15)' }}
                                    >
                                        <p className="text-xs text-[#00e676]/80 font-mono">{message}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-600 font-mono uppercase tracking-widest mb-1.5">
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8))}
                                        placeholder="00000000"
                                        required
                                        maxLength={8}
                                        autoFocus
                                        className="w-full px-4 py-3.5 rounded-xl text-center text-2xl font-mono text-[#00e676] tracking-[0.3em] placeholder-gray-700 focus:outline-none transition-all"
                                        style={{
                                            background: 'rgba(0,230,118,0.04)',
                                            border: '1px solid rgba(0,230,118,0.12)',
                                            textShadow: '0 0 20px rgba(0,230,118,0.3)',
                                        }}
                                        onFocus={e => {
                                            (e.target as HTMLElement).style.border = '1px solid rgba(0,230,118,0.3)';
                                            (e.target as HTMLElement).style.background = 'rgba(0,230,118,0.06)';
                                        }}
                                        onBlur={e => {
                                            (e.target as HTMLElement).style.border = '1px solid rgba(0,230,118,0.12)';
                                            (e.target as HTMLElement).style.background = 'rgba(0,230,118,0.04)';
                                        }}
                                    />
                                    <p className="text-[10px] text-gray-700 font-mono mt-1.5">
                                        Sent to <span className="text-gray-500">{email}</span> · expires in 10 min
                                    </p>
                                </div>

                                {error && (
                                    <div
                                        className="px-3 py-2.5 rounded-xl"
                                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                                    >
                                        <p className="text-xs text-red-400 font-mono">{error}</p>
                                    </div>
                                )}

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading || otp.length < 6}
                                    className="w-full py-2.5 rounded-xl text-sm font-semibold font-mono transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2"
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
                                                className="w-3.5 h-3.5 rounded-full"
                                                style={{
                                                    border: '2px solid rgba(0,230,118,0.2)',
                                                    borderTopColor: '#00e676',
                                                    animation: 'spin 0.8s linear infinite',
                                                }}
                                            />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify & Enter →'
                                    )}
                                </motion.button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => { setStep('credentials'); setOtp(''); setError(null); setMessage(null); }}
                                        className="text-xs text-gray-600 font-mono transition-colors hover:text-[#00e676]"
                                    >
                                        ← Back to credentials
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Security note */}
                    <div
                        className="mt-6 pt-4 relative z-10"
                        style={{ borderTop: '1px solid rgba(0,230,118,0.06)' }}
                    >
                        <div className="flex items-start gap-2">
                            <ShieldCheck size={12} className="text-[#00e676]/40 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-gray-700 leading-relaxed font-mono">
                                Protected by Supabase Auth · PKCE flow · rate limited · encrypted sessions
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
