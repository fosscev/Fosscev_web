"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { PicksUser } from '@/lib/picks-db';

interface PicksAuthContextType {
    user: PicksUser | null;
    authId: string | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const PicksAuthContext = createContext<PicksAuthContextType>({
    user: null,
    authId: null,
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
    const [loading, setLoading] = useState(true);

    const fetchPicksUser = useCallback(async (supabaseAuthId: string) => {
        try {
            const { data } = await supabase
                .from('picks_users')
                .select('*')
                .eq('auth_id', supabaseAuthId)
                .single();
            setUser(data);
            setAuthId(supabaseAuthId);
        } catch {
            setUser(null);
            setAuthId(null);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
            await fetchPicksUser(authUser.id);
        } else {
            setUser(null);
            setAuthId(null);
        }
    }, [fetchPicksUser]);

    useEffect(() => {
        // Check current session
        const init = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) {
                    await fetchPicksUser(authUser.id);
                }
            } catch {
                // Not logged in
            }
            setLoading(false);
        };

        init();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    await fetchPicksUser(session.user.id);
                } else {
                    setUser(null);
                    setAuthId(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchPicksUser]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setAuthId(null);
    };

    return (
        <PicksAuthContext.Provider value={{ user, authId, loading, signOut, refreshUser }}>
            {children}
        </PicksAuthContext.Provider>
    );
}
