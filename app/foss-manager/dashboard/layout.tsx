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
        <div className="min-h-screen bg-gray-900 text-white">
            <nav className="border-b border-gray-800 bg-gray-950 p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-primary">FOSS Manager</h1>
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
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </nav>
            <main className="container mx-auto p-4">{children}</main>
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
