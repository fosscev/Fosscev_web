"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface AdminAuthContextType {
    user: any | null;
    session: any | null;
    accessToken: string | null;
    authLoading: boolean;
    signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
    user: null,
    session: null,
    accessToken: null,
    authLoading: true,
    signOut: async () => {},
});

export function useAdminAuth() {
    return useContext(AdminAuthContext);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        let subscription: any;

        const init = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                setSession(currentSession);
                setUser(currentSession?.user || null);
                setAccessToken(currentSession?.access_token || null);
            } catch {
                // Ignore
            } finally {
                setAuthLoading(false);

                // Register listener only after getSession completes to prevent LockManager contention
                const { data } = supabase.auth.onAuthStateChange(
                    async (_event, session) => {
                        setSession(session);
                        setUser(session?.user || null);
                        setAccessToken(session?.access_token || null);
                        setAuthLoading(false);
                    }
                );
                subscription = data.subscription;
            }
        };

        init();

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setAccessToken(null);
    };

    return (
        <AdminAuthContext.Provider value={{ user, session, accessToken, authLoading, signOut }}>
            {children}
        </AdminAuthContext.Provider>
    );
}
