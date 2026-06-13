"use client";

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Calendar, Activity, PenTool } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePicksAuth } from '@/components/picks/PicksAuthProvider';
import { PostCard } from '@/components/picks/PostCard';
import type { PicksPost } from '@/lib/picks-db';

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading } = usePicksAuth();
    const [savedPosts, setSavedPosts] = useState<PicksPost[]>([]);
    const [myPosts, setMyPosts] = useState<PicksPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'saved' | 'mine'>('saved');

    const fetchPosts = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { supabase } = await import('@/lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const headers = { 'Authorization': `Bearer ${session.access_token}` };
            
            const [savedRes, mineRes] = await Promise.all([
                fetch('/api/picks/posts?saved=true', { headers }),
                fetch('/api/picks/posts?mine=true', { headers })
            ]);

            if (savedRes.ok) {
                const data = await savedRes.json();
                setSavedPosts(data.posts || []);
            }
            if (mineRes.ok) {
                const data = await mineRes.json();
                setMyPosts(data.posts || []);
            }
        } catch (e) {
            console.error('Error fetching posts', e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/picks');
        } else if (user) {
            fetchPosts();
        }
    }, [user, authLoading, router, fetchPosts]);

    if (authLoading || (!user && loading)) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-full"
                        style={{
                            border: '2px solid rgba(0,230,118,0.1)',
                            borderTopColor: '#00e676',
                            animation: 'spin 0.8s linear infinite',
                        }}
                    />
                    <p className="text-xs text-gray-600 font-mono">
                        <span className="text-[#00e676]/40">$</span> loading profile...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const memberSince = new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
    });

    const avatarHue = (user.username || '').charCodeAt(0) * 37 % 360;

    return (
        <section className="pt-28 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
            {/* Back link */}
            <Link
                href="/picks"
                className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#00e676] transition-colors mb-8 font-mono group"
            >
                <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
                cd ../picks
            </Link>

            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden"
                style={{
                    background: 'rgba(8,8,8,0.9)',
                    border: '1px solid rgba(0,230,118,0.1)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 0 40px rgba(0,230,118,0.04)',
                }}
            >
                {/* Top line */}
                <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(0,230,118,0.3), transparent)' }}
                />
                {/* Background glow */}
                <div
                    className="absolute top-0 left-0 w-80 h-80 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 0% 0%, rgba(0,230,118,0.04) 0%, transparent 60%)` }}
                />

                {/* Avatar */}
                <div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-bold flex-shrink-0 relative z-10 font-mono"
                    style={{
                        background: `hsl(${avatarHue}, 40%, 18%)`,
                        color: `hsl(${avatarHue}, 60%, 65%)`,
                        border: `1px solid hsl(${avatarHue}, 40%, 28%)`,
                        boxShadow: `0 0 30px hsl(${avatarHue}, 40%, 18%)`,
                    }}
                >
                    {(user.username || '?')[0].toUpperCase()}
                </div>

                <div className="flex-1 text-center md:text-left relative z-10">
                    {/* Online badge */}
                    <div className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-full font-mono"
                        style={{
                            background: 'rgba(0,230,118,0.06)',
                            border: '1px solid rgba(0,230,118,0.12)',
                        }}
                    >
                        <div
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ background: '#00e676', boxShadow: '0 0 5px #00e676' }}
                        />
                        <span className="text-[10px] text-[#00e676]/70">active member</span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-mono font-bold text-white mb-1">
                        {user.username}
                    </h1>
                    <p className="text-gray-600 text-xs font-mono mb-4">{user.email}</p>

                    <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-gray-600 font-mono">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={11} className="text-[#00e676]/50" />
                            <span>joined {memberSince}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Activity size={11} className="text-[#00e676]/50" />
                            <span>active member</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tabs & Content Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {/* Tabs */}
                <div className="flex items-center gap-3 mb-6 border-b border-[rgba(0,230,118,0.1)] pb-px">
                    <button
                        onClick={() => setActiveTab('saved')}
                        className="flex items-center gap-1.5 px-4 py-2 font-mono text-sm relative transition-colors"
                        style={{ color: activeTab === 'saved' ? '#00e676' : '#525252' }}
                    >
                        <Bookmark size={14} />
                        Saved
                        {activeTab === 'saved' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5"
                                style={{ background: '#00e676', boxShadow: '0 -2px 10px rgba(0,230,118,0.5)' }}
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('mine')}
                        className="flex items-center gap-1.5 px-4 py-2 font-mono text-sm relative transition-colors"
                        style={{ color: activeTab === 'mine' ? '#00e676' : '#525252' }}
                    >
                        <PenTool size={14} />
                        Your Picks
                        {activeTab === 'mine' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5"
                                style={{ background: '#00e676', boxShadow: '0 -2px 10px rgba(0,230,118,0.5)' }}
                            />
                        )}
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div
                            className="w-6 h-6 rounded-full"
                            style={{
                                border: '2px solid rgba(0,230,118,0.1)',
                                borderTopColor: '#00e676',
                                animation: 'spin 0.8s linear infinite',
                            }}
                        />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeTab === 'saved' && (
                            savedPosts.length === 0 ? (
                                <div className="text-center py-20 rounded-2xl" style={{ border: '1px dashed rgba(0,230,118,0.1)' }}>
                                    <p className="text-gray-500 font-mono text-sm">no saved picks yet</p>
                                </div>
                            ) : (
                                savedPosts.map((post, i) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <PostCard post={post} onAuthRequired={() => {}} />
                                    </motion.div>
                                ))
                            )
                        )}

                        {activeTab === 'mine' && (
                            myPosts.length === 0 ? (
                                <div className="text-center py-20 rounded-2xl" style={{ border: '1px dashed rgba(0,230,118,0.1)' }}>
                                    <p className="text-gray-500 font-mono text-sm">you haven't submitted any picks yet</p>
                                </div>
                            ) : (
                                myPosts.map((post, i) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <PostCard post={post} onAuthRequired={() => {}} />
                                    </motion.div>
                                ))
                            )
                        )}
                    </div>
                )}
            </motion.div>
        </section>
    );
}
