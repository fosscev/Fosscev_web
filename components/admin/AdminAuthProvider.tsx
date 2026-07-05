"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabaseAdmin as supabase } from '@/lib/supabase';

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

        const checkAuth = async () => {
            try {
                // Initialize session state on mount
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                
                // Set up listener for auth state changes
                const { data } = supabase.auth.onAuthStateChange(
                    async (event, currentSession) => {
                        setSession(currentSession);
                        setUser(currentSession?.user ?? null);
                        setAccessToken(currentSession?.access_token || null);
                        setAuthLoading(false);

                        // If Supabase silently refreshes the token, we MUST explicitly refresh our marker cookie!
                        if (event === 'TOKEN_REFRESHED') {
                            try {
                                await fetch('/api/admin/auth/refresh-marker', { method: 'POST' });
                            } catch (e) {
                                console.error('Failed to refresh admin marker cookie', e);
                            }
                        }
                    }
                );
                subscription = data.subscription;

                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                setAccessToken(currentSession?.access_token || null);
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                setAuthLoading(false);
            }
        };

        checkAuth();

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, []);

    const signOut = async () => {
        setAuthLoading(true);
        try {
            // This calls the server-side route which clears BOTH the Supabase cookie and the marker cookie
            await fetch('/api/admin/auth/signout', { method: 'POST' });
        } catch (e) {
            console.error('Signout failed', e);
        }
        setUser(null);
        setSession(null);
        setAccessToken(null);
        setAuthLoading(false);
    };

    return (
        <AdminAuthContext.Provider value={{ user, session, accessToken, authLoading, signOut }}>
            {children}
        </AdminAuthContext.Provider>
    );
}
