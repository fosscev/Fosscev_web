"use client";

import { useState, Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, ShieldCheck, User, Check, AlertCircle, Key, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { usePicksAuth } from '@/components/picks/PicksAuthProvider';

type Mode = 'signin' | 'signup' | 'verify';

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

function maskEmail(emailStr: string) {
    if (!emailStr) return '';
    const [local, domain] = emailStr.split('@');
    if (!local || !domain) return emailStr;
    if (local.length <= 2) {
        return `${local[0]}*@${domain}`;
    }
    return `${local.slice(0, 2)}${'*'.repeat(Math.max(2, local.length - 2))}@${domain}`;
}

function PicksSignInPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const modeParam = searchParams.get('mode');
    const { user } = usePicksAuth();
    
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
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState<string[]>(Array(8).fill(''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    
    // Progressive Loading Steps
    const [signupStep, setSignupStep] = useState<'creating' | 'sending' | 'redirecting' | ''>('');
    
    // Timer State
    const [timeLeft, setTimeLeft] = useState(100);
    const [timerActive, setTimerActive] = useState(false);
    const [resendSuccessMessage, setResendSuccessMessage] = useState<string | null>(null);
    const [verifySuccess, setVerifySuccess] = useState(false);

    // Sync mode parameter
    useEffect(() => {
        if (modeParam === 'signup') {
            setMode('signup');
        } else if (modeParam === 'signin') {
            setMode('signin');
        } else if (modeParam === 'verify') {
            setMode('verify');
            const emailParam = searchParams.get('email');
            if (emailParam) {
                setEmail(emailParam);
            }
        }
    }, [modeParam, searchParams]);

    // Handle Countdown Timer
    useEffect(() => {
        let interval: any;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    // Reset OTP Timer on page switch to Verify
    useEffect(() => {
        if (mode === 'verify') {
            setTimeLeft(100);
            setTimerActive(true);
            setOtp(Array(8).fill(''));
            setError(null);
            setMessage(null);
            setResendSuccessMessage(null);
            
            // Auto focus on first box
            setTimeout(() => {
                const firstInput = document.getElementById('otp-0');
                firstInput?.focus();
            }, 100);
        } else {
            setTimerActive(false);
        }
    }, [mode]);

    // Real-time validations
    const isUsernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
    const passHasLetter = /[a-zA-Z]/.test(password);
    const passHasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
    const passLengthOk = password.length >= 12;
    const passMatchOk = confirmPassword !== '' && password === confirmPassword;

    const handleCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'signup') {
                // Form field validations
                if (!isUsernameValid) {
                    setError('Username must be 3-20 characters long and contain only letters, numbers, or underscores.');
                    setLoading(false);
                    return;
                }
                if (!isAllowedEmailDomain(email)) {
                    setError('Please use a valid email address (@cev.ac.in, @gmail.com, @outlook.com, @yahoo.com, or @hotmail.com)');
                    setLoading(false);
                    return;
                }
                if (!passLengthOk || !passHasLetter || !passHasNumberOrSpecial) {
                    setError('Please satisfy all password security requirements.');
                    setLoading(false);
                    return;
                }
                if (!passMatchOk) {
                    setError('Passwords do not match.');
                    setLoading(false);
                    return;
                }

                // Call Supabase auth signup directly
                setSignupStep('creating');
                await new Promise(resolve => setTimeout(resolve, 800));

                setSignupStep('sending');
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username,
                        },
                        emailRedirectTo: `${window.location.origin}/picks`,
                    },
                });

                if (signUpError) {
                    setError(signUpError.message);
                    setLoading(false);
                    setSignupStep('');
                    return;
                }

                setSignupStep('redirecting');
                await new Promise(resolve => setTimeout(resolve, 800));
                
                setSignupStep('');
                setLoading(false);
                
                // Automatically redirect to the OTP Verification page
                router.push(`/picks/signin?mode=verify&email=${encodeURIComponent(email)}`);
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

                const redirectUrl = searchParams.get('redirect') === 'write' ? '/picks/write' : '/picks';
                router.replace(redirectUrl);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
            setSignupStep('');
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 8) {
            setError('Please enter all 8 digits of the verification code.');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);
        setResendSuccessMessage(null);

        try {
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: 'signup',
            });

            if (verifyError) {
                setError(verifyError.message || 'Invalid or expired verification code.');
                setLoading(false);
                return;
            }

            setVerifySuccess(true);
            setLoading(false);

            // Short successful verification delay
            setTimeout(() => {
                const redirectUrl = searchParams.get('redirect') === 'write' ? '/picks/write' : '/picks';
                router.replace(redirectUrl);
            }, 3000);
        } catch (err) {
            setError('Failed to verify OTP. Please try again.');
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        setResendSuccessMessage(null);

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

            setResendSuccessMessage('A new verification code has been sent.');
            setTimeLeft(100);
            setTimerActive(true);
            setOtp(Array(8).fill(''));
            
            // Focus back to first slot
            setTimeout(() => {
                const firstInput = document.getElementById('otp-0');
                firstInput?.focus();
            }, 100);
        } catch (err) {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // OTP Navigation and inputs
    const handleOtpChange = (value: string, index: number) => {
        // Alphanumeric values allowed
        if (!/^[a-zA-Z0-9]*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Move to next input box if typed
        if (value && index < 7) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            const newOtp = [...otp];
            if (!otp[index] && index > 0) {
                newOtp[index - 1] = '';
                setOtp(newOtp);
                const prevInput = document.getElementById(`otp-${index - 1}`);
                prevInput?.focus();
            } else {
                newOtp[index] = '';
                setOtp(newOtp);
            }
            e.preventDefault();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
            e.preventDefault();
        } else if (e.key === 'ArrowRight' && index < 7) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
            e.preventDefault();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim().slice(0, 8);
        if (!/^[a-zA-Z0-9]{1,8}$/.test(pastedData)) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        // Focus the last filled input
        const lastIdx = Math.min(pastedData.length, 7);
        const targetInput = document.getElementById(`otp-${lastIdx}`);
        targetInput?.focus();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Neon & visual color logic for the card matching timer states
    const getGlowStyle = () => {
        if (mode === 'verify') {
            if (timeLeft >= 30) return 'radial-gradient(ellipse at 50% 0%, rgba(0,230,118,0.07) 0%, transparent 70%)';
            if (timeLeft >= 10) return 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.07) 0%, transparent 70%)';
            return 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.07) 0%, transparent 70%)';
        }
        return 'radial-gradient(ellipse at 50% 0%, rgba(216,90,48,0.06) 0%, transparent 70%)';
    };

    const getBorderColor = () => {
        if (mode === 'verify') {
            if (timeLeft >= 30) return 'rgba(0,230,118,0.12)';
            if (timeLeft >= 10) return 'rgba(249,115,22,0.12)';
            return 'rgba(239,68,68,0.12)';
        }
        return 'rgba(216,90,48,0.1)';
    };

    const getTimerColorClass = () => {
        if (timeLeft >= 30) return 'text-[#00E676] drop-shadow-[0_0_8px_rgba(0,230,118,0.4)] border-[#00E676]/30';
        if (timeLeft >= 10) return 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)] border-orange-500/30';
        return 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)] border-red-500/30 animate-pulse';
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
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6 font-mono"
                >
                    <ArrowLeft size={14} />
                    Back to Picks
                </Link>

                <div
                    className="bg-[#0a0a0a]/95 border rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all duration-500"
                    style={{
                        borderColor: getBorderColor(),
                        boxShadow: mode === 'verify' 
                            ? (timeLeft >= 30 ? '0 0 60px rgba(0,230,118,0.05), 0 25px 60px rgba(0,0,0,0.6)' 
                               : timeLeft >= 10 ? '0 0 60px rgba(249,115,22,0.05), 0 25px 60px rgba(0,0,0,0.6)' 
                               : '0 0 60px rgba(239,68,68,0.05), 0 25px 60px rgba(0,0,0,0.6)')
                            : '0 0 60px rgba(216,90,48,0.05), 0 25px 60px rgba(0,0,0,0.6)',
                    }}
                >
                    {/* Top Accent Line */}
                    <div
                        className="absolute top-0 left-0 right-0 h-px transition-all duration-500"
                        style={{
                            background: mode === 'verify'
                                ? (timeLeft >= 30 ? 'linear-gradient(90deg, transparent, rgba(0,230,118,0.4), transparent)'
                                   : timeLeft >= 10 ? 'linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent)'
                                   : 'linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent)')
                                : 'linear-gradient(90deg, transparent, rgba(216,90,48,0.4), transparent)',
                        }}
                    />

                    {/* Background Radial Glow */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none transition-all duration-500"
                        style={{
                            background: getGlowStyle(),
                        }}
                    />

                    {verifySuccess ? (
                        /* SUCCESS SCREEN */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8 space-y-6"
                        >
                            <div className="w-16 h-16 bg-[#00E676]/10 border border-[#00E676]/30 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(0,230,118,0.25)]">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                                >
                                    <Check size={32} className="text-[#00E676]" />
                                </motion.div>
                            </div>
                            
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-white font-mono">
                                    ✓ Account Verified Successfully
                                </h2>
                                <p className="text-base text-gray-200 font-body font-semibold">
                                    Welcome to FOSS Club CEV!
                                </p>
                                <p className="text-sm text-gray-400 font-body">
                                    Your account has been activated successfully.
                                </p>
                            </div>

                            {/* Cyberpunk progress line */}
                            <div className="w-full max-w-xs mx-auto h-1 bg-white/[0.04] border border-white/[0.08] rounded-full overflow-hidden relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 2.8, ease: 'linear' }}
                                    className="h-full bg-gradient-to-r from-[#00E676] to-[#00A854]"
                                    style={{
                                        boxShadow: '0 0 10px rgba(0, 230, 118, 0.5)'
                                    }}
                                />
                            </div>
                            <p className="text-[10px] text-gray-600 font-mono">Loading community picks board...</p>
                        </motion.div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="text-center mb-6 relative z-10">
                                {mode === 'verify' ? (
                                    <>
                                        <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-colors duration-500"
                                            style={{
                                                background: timeLeft >= 30 
                                                    ? 'linear-gradient(135deg, rgba(0, 230, 118, 0.2), rgba(0, 230, 118, 0.05))'
                                                    : timeLeft >= 10 
                                                    ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(249, 115, 22, 0.05))'
                                                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))',
                                                border: timeLeft >= 30 
                                                    ? '1px solid rgba(0, 230, 118, 0.25)' 
                                                    : timeLeft >= 10 
                                                    ? '1px solid rgba(249, 115, 22, 0.25)' 
                                                    : '1px solid rgba(239, 68, 68, 0.25)',
                                            }}>
                                            <Key size={22} className={`transition-colors duration-500 ${
                                                timeLeft >= 30 ? 'text-[#00E676]' : timeLeft >= 10 ? 'text-orange-500' : 'text-red-500 animate-pulse'
                                            }`} />
                                        </div>
                                        <h1 className="text-2xl font-bold text-white font-display mb-1">
                                            Email Verification
                                        </h1>
                                        <p className="text-sm text-gray-400 font-body leading-relaxed max-w-xs mx-auto">
                                            We&apos;ve sent an 8-digit verification code to <span className="text-gray-200 font-mono text-xs block mt-0.5">{maskEmail(email)}</span>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(216, 90, 48, 0.2), rgba(216, 90, 48, 0.05))',
                                                border: '1px solid rgba(216, 90, 48, 0.2)',
                                            }}>
                                            <ShieldCheck size={22} className="text-[#D85A30]" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-white font-display mb-1">
                                            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                                        </h1>
                                        <p className="text-sm text-gray-500">
                                            {mode === 'signup' ? 'Join the FOSS CEV community' : 'Sign in to your account'}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* PROGRESSIVE LOADER DURING SIGNUP */}
                            {signupStep ? (
                                <div className="flex flex-col items-center justify-center py-10 space-y-6 relative z-10">
                                    <div className="relative w-16 h-16">
                                        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                                        <div className="absolute inset-0 rounded-full border-2 border-[#D85A30] border-t-transparent animate-spin" />
                                    </div>
                                    <div className="space-y-4 w-full max-w-xs px-4">
                                        <div className="flex items-center gap-3 text-sm font-mono transition-all">
                                            {signupStep === 'creating' ? (
                                                <div className="w-4 h-4 border-2 border-[#D85A30] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                            ) : (
                                                <Check size={16} className="text-[#00E676] flex-shrink-0" />
                                            )}
                                            <span className={signupStep === 'creating' ? 'text-white' : 'text-gray-500'}>
                                                Creating your account...
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-mono transition-all">
                                            {signupStep === 'creating' ? (
                                                <div className="w-4 h-4 rounded-full bg-gray-800 flex-shrink-0" />
                                            ) : signupStep === 'sending' ? (
                                                <div className="w-4 h-4 border-2 border-[#D85A30] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                            ) : (
                                                <Check size={16} className="text-[#00E676] flex-shrink-0" />
                                            )}
                                            <span className={signupStep === 'sending' ? 'text-white' : signupStep === 'creating' ? 'text-gray-600' : 'text-gray-500'}>
                                                Sending verification code...
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-mono transition-all">
                                            {signupStep !== 'redirecting' ? (
                                                <div className="w-4 h-4 rounded-full bg-gray-800 flex-shrink-0" />
                                            ) : (
                                                <div className="w-4 h-4 border-2 border-[#D85A30] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                            )}
                                            <span className={signupStep === 'redirecting' ? 'text-white font-semibold' : 'text-gray-600'}>
                                                Redirecting to verification...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form
                                    onSubmit={mode === 'verify' ? handleVerifyOtp : handleCredentials}
                                    className="space-y-4 relative z-10"
                                >
                                    {mode === 'verify' ? (
                                        <>
                                            {/* OTP Digit Input Boxes */}
                                            <div className="grid grid-cols-8 gap-1.5 md:gap-2 max-w-sm mx-auto justify-center my-6">
                                                {otp.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        id={`otp-${index}`}
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[a-zA-Z0-9]*"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={(e) => handleOtpChange(e.target.value, index)}
                                                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                                        onPaste={handleOtpPaste}
                                                        className="w-10 h-12 md:w-11 md:h-13 bg-white/[0.03] border border-white/[0.1] text-white focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676]/20 transition-all font-mono text-center text-lg md:text-xl font-bold rounded-lg shadow-inner focus:shadow-[0_0_12px_rgba(0,230,118,0.25)]"
                                                        autoComplete="one-time-code"
                                                    />
                                                ))}
                                            </div>

                                            {/* Countdown timer */}
                                            <div className="flex flex-col items-center justify-center gap-1 my-4">
                                                {timeLeft > 0 ? (
                                                    <>
                                                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                                            Verification code expires in
                                                        </span>
                                                        <span className={`text-lg font-bold font-mono tracking-widest px-3 py-1 bg-white/[0.02] border rounded-lg transition-all duration-300 ${getTimerColorClass()}`}>
                                                            {formatTime(timeLeft)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-xs font-mono text-red-500 font-semibold uppercase tracking-wider animate-pulse">
                                                        Verification code expired.
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Username (Sign up Only) */}
                                            {mode === 'signup' && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-400 mb-1.5 font-mono">
                                                        Username
                                                    </label>
                                                    <div className="relative">
                                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                                        <input
                                                            type="text"
                                                            value={username}
                                                            onChange={(e) => setUsername(e.target.value)}
                                                            placeholder="cyber_pioneer"
                                                            required
                                                            className={`w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-all ${
                                                                username === '' 
                                                                    ? 'border-white/8 focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20'
                                                                    : isUsernameValid
                                                                    ? 'border-[#00E676]/30 focus:border-[#00E676]/60 focus:ring-1 focus:ring-[#00E676]/10'
                                                                    : 'border-red-500/30 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/10'
                                                            }`}
                                                        />
                                                    </div>
                                                    {username !== '' && !isUsernameValid && (
                                                        <p className="text-[10px] text-red-400 font-mono mt-1">
                                                            Letters, numbers, underscores (3-20 characters).
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Email Address */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1.5 font-mono">
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
                                                        className={`w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-all ${
                                                            email === ''
                                                                ? 'border-white/8 focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20'
                                                                : isAllowedEmailDomain(email)
                                                                ? 'border-[#00E676]/30 focus:border-[#00E676]/60 focus:ring-1 focus:ring-[#00E676]/10'
                                                                : 'border-red-500/30 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/10'
                                                        }`}
                                                    />
                                                </div>
                                                {mode === 'signup' && (
                                                    <p className="text-[10px] text-gray-500 font-mono mt-1">
                                                        Accepts @gmail.com, @outlook.com, @yahoo.com, @hotmail.com, and @cev.ac.in
                                                    </p>
                                                )}
                                            </div>

                                            {/* Password */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1.5 font-mono">
                                                    Password
                                                </label>
                                                <div className="relative">
                                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                                    <input
                                                        type="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder="••••••••••••"
                                                        required
                                                        className={`w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all ${
                                                            mode === 'signup' && password !== ''
                                                                ? (passLengthOk && passHasLetter && passHasNumberOrSpecial 
                                                                    ? 'border-[#00E676]/30'
                                                                    : 'border-red-500/30')
                                                                : 'border-white/8'
                                                        }`}
                                                    />
                                                </div>
                                                {mode === 'signin' && (
                                                    <p className="text-[11px] text-gray-600 mt-1">Minimum 6 characters</p>
                                                )}
                                            </div>

                                            {/* Confirm Password (Sign up Only) */}
                                            {mode === 'signup' && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-400 mb-1.5 font-mono">
                                                        Confirm Password
                                                    </label>
                                                    <div className="relative">
                                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                                        <input
                                                            type="password"
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            placeholder="••••••••••••"
                                                            required
                                                            className={`w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all ${
                                                                confirmPassword !== ''
                                                                    ? (passMatchOk ? 'border-[#00E676]/30' : 'border-red-500/30')
                                                                    : 'border-white/8'
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Password Requirements Panel */}
                                            {mode === 'signup' && password !== '' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl space-y-2"
                                                >
                                                    <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 font-semibold">
                                                        Password Requirements
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${passLengthOk ? 'bg-[#00E676] shadow-[0_0_6px_#00E676]' : 'bg-gray-800'}`} />
                                                            <span className={passLengthOk ? 'text-gray-300' : 'text-gray-600'}>12+ Characters</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${passHasLetter ? 'bg-[#00E676] shadow-[0_0_6px_#00E676]' : 'bg-gray-800'}`} />
                                                            <span className={passHasLetter ? 'text-gray-300' : 'text-gray-600'}>At least 1 letter</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${passHasNumberOrSpecial ? 'bg-[#00E676] shadow-[0_0_6px_#00E676]' : 'bg-gray-800'}`} />
                                                            <span className={passHasNumberOrSpecial ? 'text-gray-300' : 'text-gray-600'}>Number/Symbol</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${passMatchOk ? 'bg-[#00E676] shadow-[0_0_6px_#00E676]' : 'bg-gray-800'}`} />
                                                            <span className={passMatchOk ? 'text-gray-300' : 'text-gray-600'}>Passwords match</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </>
                                    )}

                                    {/* Notifications */}
                                    <AnimatePresence mode="wait">
                                        {error && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="px-3.5 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5"
                                            >
                                                <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                                                <div className="text-xs text-red-400 font-mono leading-relaxed">
                                                    {error}
                                                </div>
                                            </motion.div>
                                        )}

                                        {message && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="px-3.5 py-2.5 bg-[#D85A30]/10 border border-[#D85A30]/20 rounded-xl flex items-start gap-2.5"
                                            >
                                                <Check size={16} className="text-[#D85A30] mt-0.5 flex-shrink-0" />
                                                <div className="text-xs text-[#D85A30] font-mono leading-relaxed">
                                                    {message}
                                                </div>
                                            </motion.div>
                                        )}

                                        {resendSuccessMessage && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="px-3.5 py-2.5 bg-[#00E676]/10 border border-[#00E676]/20 rounded-xl flex items-start gap-2.5"
                                            >
                                                <Check size={16} className="text-[#00E676] mt-0.5 flex-shrink-0" />
                                                <div className="text-xs text-[#00E676] font-mono leading-relaxed">
                                                    {resendSuccessMessage}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Action button */}
                                    {mode === 'verify' ? (
                                        <motion.button
                                            whileTap={{ scale: 0.97 }}
                                            type="submit"
                                            disabled={loading || timeLeft === 0}
                                            className="w-full py-2.5 rounded-xl text-sm font-semibold font-mono transition-all duration-200 disabled:opacity-30 flex items-center justify-center gap-2"
                                            style={{
                                                background: 'linear-gradient(135deg, #D85A30, #e06b3a)',
                                                color: '#fff',
                                                boxShadow: loading || timeLeft === 0 ? 'none' : '0 4px 20px rgba(216, 90, 48, 0.2)',
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <RefreshCw size={16} className="animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                'Verify Account'
                                            )}
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            whileTap={{ scale: 0.97 }}
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-2.5 rounded-xl text-sm font-semibold font-mono transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                            style={{
                                                background: 'linear-gradient(135deg, #D85A30, #e06b3a)',
                                                color: '#fff',
                                                boxShadow: '0 4px 20px rgba(216, 90, 48, 0.2)',
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <RefreshCw size={16} className="animate-spin" />
                                                    {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                                                </>
                                            ) : (
                                                mode === 'signup' ? 'Create Account' : 'Sign In'
                                            )}
                                        </motion.button>
                                    )}

                                    {/* Footer / Toggle Switch */}
                                    <div className="text-center pt-2">
                                        {mode === 'verify' ? (
                                            <div className="flex flex-col gap-3 items-center">
                                                <button
                                                    type="button"
                                                    disabled={loading || timeLeft > 0}
                                                    onClick={handleResendOtp}
                                                    className="text-xs text-[#D85A30] hover:underline disabled:opacity-40 font-mono font-medium transition-all"
                                                >
                                                    Resend Code
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMode('signup');
                                                        setError(null);
                                                        setMessage(null);
                                                        setResendSuccessMessage(null);
                                                    }}
                                                    className="text-xs text-gray-500 hover:text-[#D85A30] transition-colors font-mono"
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
                                                    setResendSuccessMessage(null);
                                                }}
                                                className="text-xs text-gray-500 hover:text-[#D85A30] transition-colors group font-mono"
                                            >
                                                {mode === 'signin' ? (
                                                    <>
                                                        <span>Don&apos;t have an account? </span>
                                                        <span
                                                            className="inline-block relative text-[#D85A30] font-semibold transition-all duration-300
                                                                       group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(216,90,48,0.7)] underline-hover-effect-orange"
                                                        >
                                                            Sign up
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Already have an account? </span>
                                                        <span
                                                            className="inline-block relative text-[#D85A30] font-semibold transition-all duration-300
                                                                       group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(216,90,48,0.7)] underline-hover-effect-orange"
                                                        >
                                                            Sign In
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            )}
                        </>
                    )}

                    {/* Security note */}
                    <div className="mt-6 pt-4 border-t border-white/[0.06] relative z-10">
                        <div className="flex items-start gap-2">
                            <ShieldCheck size={14} className="text-gray-600 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] text-gray-600 leading-relaxed font-mono">
                                Protected by Supabase Auth with PKCE flow, rate limiting, and encrypted sessions. Your credentials are never stored in plain text.
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
