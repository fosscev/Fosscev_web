"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAdmin as supabase } from '@/lib/supabase';

const MIN_PASSWORD_LENGTH = 12;

export default function ResetAdminPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'checking' | 'confirm' | 'verifying' | 'ready' | 'invalid' | 'complete'>('checking');
    const [tokenHash, setTokenHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let recoveryReceived = false;
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' && session) {
                recoveryReceived = true;
                setStatus('ready');
            }
        });

        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const token = params.get('token_hash') || hashParams.get('token_hash');
        const type = params.get('type') || hashParams.get('type');
        if (token && type === 'recovery') {
            setTokenHash(token);
            setStatus('confirm');
            // Keep the one-time token out of the address bar and subsequent history.
            window.history.replaceState({}, '', window.location.pathname);
        } else if (hashParams.has('error') || params.has('error')) {
            setStatus('invalid');
            window.history.replaceState({}, '', window.location.pathname);
        }

        // Accept existing links already issued with Supabase's direct callback flow.
        const timeout = window.setTimeout(() => {
            if (!recoveryReceived && !token) setStatus('invalid');
        }, 3500);

        return () => {
            window.clearTimeout(timeout);
            subscription.unsubscribe();
        };
    }, []);

    const confirmRecovery = async () => {
        if (!tokenHash) return;
        setStatus('verifying');
        setError(null);
        try {
            const response = await fetch('/api/admin/auth/recover-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
                body: JSON.stringify({ tokenHash, type: 'recovery' }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.session?.access_token || !result.session?.refresh_token) {
                throw new Error(result.error || 'This reset link is invalid or expired. Request a new one.');
            }

            const { error: sessionError } = await supabase.auth.setSession({
                access_token: result.session.access_token,
                refresh_token: result.session.refresh_token,
            });
            if (sessionError) throw sessionError;
            setTokenHash(null);
            setStatus('ready');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'This reset link is invalid or expired. Request a new one.');
            setStatus('invalid');
        }
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        if (password.length < MIN_PASSWORD_LENGTH) return setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
        if (password !== confirmPassword) return setError('Passwords do not match.');

        setSaving(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;
            await supabase.auth.signOut({ scope: 'global' });
            setStatus('complete');
        } catch {
            setError('This reset link is invalid or has expired. Request a new one and try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#050505] p-4 text-white">
            <section className="w-full max-w-md rounded-2xl border border-emerald-400/15 bg-[#080808] p-8 shadow-2xl shadow-black/40">
                <h1 className="text-2xl font-bold font-mono">Reset admin password</h1>
                {status === 'checking' && <p className="mt-4 text-sm text-gray-400">Verifying reset link…</p>}
                {status === 'confirm' && <>
                    <p className="mt-4 text-sm text-gray-300">Your reset link is ready. Continue to verify it and choose a new password.</p>
                    <button onClick={confirmRecovery} className="mt-6 w-full rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-black">Continue</button>
                </>}
                {status === 'verifying' && <p className="mt-4 text-sm text-gray-400">Verifying reset link…</p>}
                {status === 'invalid' && <>
                    <p className="mt-4 text-sm text-red-400">{error || 'This reset link is invalid or expired. Request a new link from the admin sign-in page.'}</p>
                    <button onClick={() => router.push('/foss-manager')} className="mt-6 text-sm text-emerald-400 hover:text-emerald-300">Back to sign in</button>
                </>}
                {status === 'complete' && <p className="mt-4 text-sm text-emerald-400">Password updated. Sign in using your new password.</p>}
                {status === 'ready' && (
                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <label className="block text-sm text-gray-300">New password
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-white focus:border-emerald-400 focus:outline-none" />
                        </label>
                        <label className="block text-sm text-gray-300">Confirm new password
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-white focus:border-emerald-400 focus:outline-none" />
                        </label>
                        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
                        <button type="submit" disabled={saving} className="w-full rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-black disabled:opacity-50">{saving ? 'Updating…' : 'Update password'}</button>
                    </form>
                )}
                {status === 'complete' && <button onClick={() => router.push('/foss-manager')} className="mt-6 text-sm text-emerald-400 hover:text-emerald-300">Back to sign in</button>}
            </section>
        </main>
    );
}
