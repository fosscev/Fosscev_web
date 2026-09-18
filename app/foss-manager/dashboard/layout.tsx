"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/AdminAuthProvider";

function AdminLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { session, authLoading, signOut } = useAdminAuth();
    const isSigningOutRef = useRef(false);

    useEffect(() => {
        if (!authLoading && !session) {
            router.push("/foss-manager");
        }
    }, [session, authLoading, router]);

    useEffect(() => {
        let logoutTimer: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(logoutTimer);
            // Auto logout after 15 minutes of inactivity (900000 ms)
            logoutTimer = setTimeout(async () => {
                if (isSigningOutRef.current) return;
                isSigningOutRef.current = true;
                try {
                    await signOut();
                    router.push("/foss-manager");
                } catch (error) {
                    console.error('Auto-logout error:', error);
                } finally {
                    isSigningOutRef.current = false;
                }
            }, 15 * 60 * 1000);
        };

        resetTimer();

        const updateActivity = () => {
            resetTimer();
        };

        window.addEventListener('mousemove', updateActivity, { passive: true });
        window.addEventListener('keydown', updateActivity, { passive: true });
        window.addEventListener('click', updateActivity, { passive: true });

        return () => {
            clearTimeout(logoutTimer);
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
            window.removeEventListener('click', updateActivity);
        };
    }, [router, signOut]);

    if (authLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#050505] text-white">
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-full"
                        style={{
                            border: '2px solid rgba(0,230,118,0.15)',
                            borderTopColor: '#00e676',
                            animation: 'spin 0.8s linear infinite',
                        }}
                    />
                    <span className="text-sm font-mono text-gray-400">Loading Admin Panel...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080b0a] text-white">
            <nav className="sticky top-0 z-30 border-b border-white/10 bg-gray-950/90 px-4 py-3 backdrop-blur-xl sm:px-6">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                    <div>
                        <h1 className="text-base font-bold text-primary sm:text-xl">FOSS Manager</h1>
                        <p className="hidden text-xs text-gray-500 sm:block">Community control center</p>
                    </div>
                    <button
                        onClick={async () => {
                            if (isSigningOutRef.current) return;
                            isSigningOutRef.current = true;
                            try {
                                await signOut();
                                router.push("/foss-manager");
                            } catch (error) {
                                console.error('Sign out error:', error);
                            } finally {
                                isSigningOutRef.current = false;
                            }
                        }}
                        className="rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        Sign Out
                    </button>
                </div>
            </nav>
            <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminAuthProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminAuthProvider>
    );
}
