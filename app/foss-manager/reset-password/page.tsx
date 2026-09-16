"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAdmin as supabase } from '@/lib/supabase';

const MIN_PASSWORD_LENGTH = 12;

export default function ResetAdminPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'checking' | 'ready' | 'invalid' | 'complete'>('checking');
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const verifyRecoverySession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setStatus(session ? 'ready' : 'invalid');
        };
        verifyRecoverySession();
    }, []);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        if (password.length < MIN_PASSWORD_LENGTH) return setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
        if (password !== confirmPassword) return setError('Passwords do not match.');

        setSaving(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;
            await supabase.auth.signOut();
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
                {status === 'invalid' && <p className="mt-4 text-sm text-red-400">This reset link is invalid or expired. Request a new link from the admin sign-in page.</p>}
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
                {(status === 'invalid' || status === 'complete') && <button onClick={() => router.push('/foss-manager')} className="mt-6 text-sm text-emerald-400 hover:text-emerald-300">Back to sign in</button>}
            </section>
        </main>
    );
}
