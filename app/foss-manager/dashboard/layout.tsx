"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.push("/foss-manager");
            } else {
                setIsLoading(false);
            }
        };

        checkSession();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-white">
                <div className="text-xl">Loading Admin Panel...</div>
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
