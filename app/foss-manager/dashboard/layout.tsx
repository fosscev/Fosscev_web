"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin-config";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            // getSession() is a local-only call — reads from browser storage, no network request.
            // The heavy auth validation is already handled by proxy.ts on the server.
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;

            if (!user || !isAdminEmail(user.email)) {
                // Not admin — redirect to login (proxy.ts should have caught this,
                // but this is a client-side safety net)
                router.push("/foss-manager");
                return;
            }

            setIsLoading(false);
        };

        checkSession();

        // Inactivity auto-logout (15 minutes)
        let lastActivity = Date.now();
        const updateActivity = () => {
            lastActivity = Date.now();
        };

        const interval = setInterval(async () => {
            if (Date.now() - lastActivity > 15 * 60 * 1000) {
                clearInterval(interval);
                try {
                    await supabase.auth.signOut();
                } catch {
                    // Ignore signout errors, just redirect
                }
                router.push("/foss-manager");
            }
        }, 30000);

        window.addEventListener('mousemove', updateActivity, { passive: true });
        window.addEventListener('keydown', updateActivity, { passive: true });
        window.addEventListener('click', updateActivity, { passive: true });

        return () => {
            clearInterval(interval);
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
            window.removeEventListener('click', updateActivity);
        };
    }, [router]);

    if (isLoading) {
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
                            await supabase.auth.signOut();
                            router.push("/foss-manager");
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
