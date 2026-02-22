"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                router.push('/foss-manager/dashboard');
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    // Show initial loading background to avoid hydration mismatch
    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
                <div className="text-xl font-mono animate-pulse">Initializing...</div>
            </div>
        );
    }

    // Show redirect state if session exists
    if (session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
                <div className="text-xl font-mono animate-pulse">Redirecting to Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4">
            <div className="w-full max-w-md bg-[#0a0a0a] p-8 rounded-lg shadow-2xl border border-white/10">
                <h1 className="text-3xl font-bold text-center text-white mb-8">Admin Access</h1>
                <Auth
                    supabaseClient={supabase}
                    appearance={{
                        theme: ThemeSupa,
                        variables: {
                            default: {
                                colors: {
                                    brand: '#00e676',
                                    brandAccent: '#00c853',
                                },
                            },
                        },
                    }}
                    providers={[]}
                    view="sign_in"
                    showLinks={false}
                    theme="dark"
                />
            </div>
        </div>
    );
}
