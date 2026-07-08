"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { PicksUser } from '@/lib/picks-db';

interface PicksAuthContextType {
    user: PicksUser | null;
    authId: string | null;
    session: any | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const PicksAuthContext = createContext<PicksAuthContextType>({
    user: null,
    authId: null,
    session: null,
    loading: true,
    signOut: async () => { },
    refreshUser: async () => { },
});

export function usePicksAuth() {
    return useContext(PicksAuthContext);
}

export function PicksAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<PicksUser | null>(null);
    const [authId, setAuthId] = useState<string | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPicksUser = useCallback(async (supabaseAuthId: string, email?: string, token?: string, username?: string) => {
        try {
            const { data } = await supabase
                .from('picks_users')
                .select('*')
                .eq('auth_id', supabaseAuthId)
                .single();
            
            if (data) {
                setUser(data);
                setAuthId(supabaseAuthId);
            } else if (email && token) {
                // Call server to ensure profile, which also blocks admins
                const response = await fetch('/api/picks/auth/ensure-profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ auth_id: supabaseAuthId, email, username })
                });

                if (response.ok) {
                    const result = await response.json();
                    setUser(result.user);
                    setAuthId(supabaseAuthId);
                } else {
                    console.error('Failed to ensure picks profile via API', await response.text());
                    setUser(null);
                    setAuthId(null);
                }
            } else {
                setUser(null);
                setAuthId(null);
            }
        } catch (err) {
            console.error('Error fetching picks user:', err);
            setUser(null);
            setAuthId(null);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);
            if (currentSession?.user) {
                await fetchPicksUser(currentSession.user.id, currentSession.user.email, currentSession.access_token, currentSession.user.user_metadata?.username);
            } else {
                setUser(null);
                setAuthId(null);
            }
        } catch {
            setUser(null);
            setAuthId(null);
            setSession(null);
        }
    }, [fetchPicksUser]);

    useEffect(() => {
        let subscription: any;

        // Check current session
        const init = async () => {
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                setSession(currentSession);
                if (currentSession?.user) {
                    await fetchPicksUser(currentSession.user.id, currentSession.user.email, currentSession.access_token, currentSession.user.user_metadata?.username);
                }
            } catch {
                // Not logged in
            } finally {
                setLoading(false);

                // Register listener only after getSession completes to prevent LockManager contention
                const { data } = supabase.auth.onAuthStateChange(
                    async (_event, currentSession) => {
                        setSession(currentSession);
                        if (currentSession?.user) {
                            await fetchPicksUser(currentSession.user.id, currentSession.user.email, currentSession.access_token, currentSession.user.user_metadata?.username);
                        } else {
                            setUser(null);
                            setAuthId(null);
                        }
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
    }, [fetchPicksUser]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setAuthId(null);
        setSession(null);
    };

    return (
        <PicksAuthContext.Provider value={{ user, authId, session, loading, signOut, refreshUser }}>
            {children}
        </PicksAuthContext.Provider>
    );
}
