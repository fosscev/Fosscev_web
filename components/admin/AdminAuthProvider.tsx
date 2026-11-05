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
        let active = true;
        const applySession = (currentSession: any | null) => {
            if (!active) return;
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setAccessToken(currentSession?.access_token || null);
            setAuthLoading(false);
        };

        // Register before restoring storage so INITIAL_SESSION and refresh
        // events cannot be missed while getSession is waiting on stale cookies.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
            applySession(currentSession);

            // Keep the auth callback synchronous. Awaiting network work here can
            // hold Supabase's auth lock and stall later session operations.
            if (event === 'TOKEN_REFRESHED') {
                void fetch('/api/admin/auth/refresh-marker', { method: 'POST' })
                    .catch((error) => console.error('Failed to refresh admin marker cookie', error));
            }
        });

        // Always release the login screen if session restoration hangs due to a
        // network failure or a stale refresh token.
        const initializationTimeout = window.setTimeout(() => {
            if (active) setAuthLoading(false);
        }, 5000);

        void supabase.auth.getSession()
            .then(({ data: { session: currentSession }, error }) => {
                if (!active) return;
                if (error) {
                    console.warn('Could not restore the admin session; showing sign-in.', error.message);
                    applySession(null);
                    void supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
                    void fetch('/api/admin/auth/signout', { method: 'POST' }).catch(() => undefined);
                    return;
                }
                applySession(currentSession);
            })
            .catch((error) => {
                if (!active) return;
                console.warn('Admin session initialization failed; showing sign-in.', error);
                applySession(null);
            })
            .finally(() => window.clearTimeout(initializationTimeout));

        return () => {
            active = false;
            window.clearTimeout(initializationTimeout);
            subscription.unsubscribe();
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
