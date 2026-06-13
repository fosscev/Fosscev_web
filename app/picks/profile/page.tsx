"use client";

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Loader2, Bookmark, User as UserIcon, Calendar, Activity } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePicksAuth } from '@/components/picks/PicksAuthProvider';
import { PostCard } from '@/components/picks/PostCard';
import type { PicksPost } from '@/lib/picks-db';

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading } = usePicksAuth();
    const [savedPosts, setSavedPosts] = useState<PicksPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSavedPosts = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { supabase } = await import('@/lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/picks/posts?saved=true', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setSavedPosts(data.posts);
            }
        } catch (e) {
            console.error('Error fetching saved posts', e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/picks');
        } else if (user) {
            fetchSavedPosts();
        }
    }, [user, authLoading, router, fetchSavedPosts]);

    if (authLoading || (!user && loading)) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Loader2 size={32} className="text-[#D85A30] animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const memberSince = new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
    });

    return (
        <section className="pt-28 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            {/* Back link */}
            <Link
                href="/picks"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8"
            >
                <ArrowLeft size={14} />
                Back to Feed
            </Link>

            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0a0a0a]/80 border border-white/[0.08] rounded-2xl p-6 md:p-8 mb-10 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden"
            >
                {/* Background glow */}
                <div 
                    className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
                    style={{ background: 'radial-gradient(circle at 0% 0%, #D85A30 0%, transparent 50%)' }}
                />

                <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold flex-shrink-0 relative z-10"
                    style={{
                        background: `hsl(${(user.username || '').charCodeAt(0) * 37 % 360}, 50%, 25%)`,
                        color: `hsl(${(user.username || '').charCodeAt(0) * 37 % 360}, 70%, 75%)`,
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    {(user.username || '?')[0].toUpperCase()}
                </div>

                <div className="flex-1 text-center md:text-left relative z-10">
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">
                        {user.username}
                    </h1>
                    <p className="text-gray-400 text-sm mb-4">
                        {user.email}
                    </p>

                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>Joined {memberSince}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Activity size={14} />
                            <span>Active Member</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Saved Posts Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center gap-2 mb-6">
                    <Bookmark className="text-[#D85A30]" size={20} />
                    <h2 className="text-xl font-bold text-white font-display">Saved Posts</h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} className="text-[#D85A30] animate-spin" />
                    </div>
                ) : savedPosts.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                        <Bookmark size={32} className="mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-400 mb-1">No saved posts yet</p>
                        <p className="text-sm text-gray-600">
                            When you see a tool you like, click the save button to keep it here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {savedPosts.map((post, i) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <PostCard
                                    post={post}
                                    onAuthRequired={() => {}}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </section>
    );
}
