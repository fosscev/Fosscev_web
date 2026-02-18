"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
    const router = useRouter();
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                router.push('/foss-manager/dashboard');
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                router.push('/foss-manager/dashboard');
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    if (session) {
        return null; // Redirecting...
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
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
