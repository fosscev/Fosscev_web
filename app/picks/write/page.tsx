"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePicksAuth } from '@/components/picks/PicksAuthProvider';
import { SubmitForm } from '@/components/picks/SubmitForm';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WritePickPage() {
    const { user, loading } = usePicksAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/picks/signin?redirect=write');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-[#D85A30] animate-spin" />
                    <p className="text-sm text-gray-400 font-mono">
                        Checking authentication...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <section className="pt-28 pb-20 px-4 md:px-8 max-w-5xl mx-auto min-h-screen">
            {/* Back link */}
            <Link
                href="/picks"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8"
            >
                <ArrowLeft size={14} />
                Back to Picks
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Form Column */}
                <div className="lg:col-span-2">
                    <h1 className="text-3xl font-display font-bold text-white mb-6">Write a Pick</h1>
                    <SubmitForm
                        onClose={() => router.push('/picks')}
                        onPostCreated={() => router.push('/picks')}
                        onAuthRequired={() => router.push('/picks/signin?redirect=write')}
                    />
                </div>

                {/* Guidelines Column */}
                <div className="lg:col-span-1">
                    <div className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-xl p-5 sticky top-28">
                        <h3 className="text-white font-bold font-display mb-3">Guidelines</h3>
                        <ul className="text-sm text-gray-400 space-y-2 list-disc pl-4 marker:text-primary/70">
                            <li>Share real experiences with open source tools.</li>
                            <li>Choose the correct category for your post.</li>
                            <li>Keep content relevant and respectful.</li>
                            <li>No spam, hate speech, or misleading information.</li>
                            <li>Respect privacy and avoid sharing sensitive data.</li>
                            <li>Flag content that violates these guidelines.</li>
                            <li>Flagged posts may be reviewed by administrators.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
