"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, PenTool } from 'lucide-react';
import { usePicksAuth } from '@/components/picks/PicksAuthProvider';
import { PostCard } from '@/components/picks/PostCard';
import { SortTabs } from '@/components/picks/SortTabs';
import { Sidebar } from '@/components/picks/Sidebar';
import { SubmitForm } from '@/components/picks/SubmitForm';
import { Pagination } from '@/components/picks/Pagination';
import { AuthModal } from '@/components/picks/AuthModal';
import { NotificationBanner } from '@/components/picks/NotificationBanner';
import { ProfileIcon } from '@/components/picks/ProfileIcon';
import { useRouter, useSearchParams } from 'next/navigation';
import type { PicksPost, SortMode, Flair } from '@/lib/picks-db';

export default function PicksPage() {
    const { user, authId } = usePicksAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasHandledWriteRef = useRef(false);

    useEffect(() => {
        if (!user) {
            hasHandledWriteRef.current = false;
            return;
        }
        if (hasHandledWriteRef.current) return;

        const shouldOpenWrite = searchParams.get("write") === "true";

        if (shouldOpenWrite) {
            hasHandledWriteRef.current = true;
            setShowSubmit(true);
            router.replace("/picks");
        }
    }, [user, searchParams, router]);

    const [posts, setPosts] = useState<PicksPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState<SortMode>('top');
    const [flair, setFlair] = useState<Flair | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showSubmit, setShowSubmit] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const fetchFeed = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                sort,
                page: page.toString(),
            });
            if (flair) params.set('flair', flair);
            if (authId) params.set('auth_id', authId);

            const res = await fetch(`/api/picks/posts?${params}`);
            if (res.ok) {
                const data = await res.json();
                setPosts(data.posts);
                setTotalPages(Math.max(1, Math.ceil(data.total / 20)));
            }
        } catch {
            // Silently fail
        } finally {
            setLoading(false);
        }
    }, [sort, page, flair, authId]);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    const handleSortChange = (newSort: SortMode) => {
        setSort(newSort);
        setPage(1);
    };

    const handleFlairChange = (newFlair: Flair | null) => {
        setFlair(newFlair);
        setPage(1);
    };

    const handleSubmitClick = () => {
        if (user) {
            setShowSubmit(true);
        } else {
            router.push('/picks/signin?redirect=write');
        }
    };

    const handleAuthRequired = () => {
        setShowAuthModal(true);
    };

    // Map SortMode to filter labels
    const getSortLabel = (sortMode: SortMode): string => {
        switch (sortMode) {
            case 'new': return 'Latest Picks';
            case 'top': return 'Most Popular';
            default: return 'Most Popular';
        }
    };

    return (
        <>
            <section className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto relative min-h-screen">
                {/* HEADER */}
                <div className="flex justify-between items-start gap-4 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1"
                    >
                        <h1 className="text-5xl md:text-6xl font-display font-black text-white mb-2">
                            Open Source Picks
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mt-4 leading-relaxed">
                            Discover experiences from the community about how open source tools solved problems, inspired projects, and made a difference.
                        </p>
                    </motion.div>

                    {user && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-shrink-0 pt-2"
                        >
                            <ProfileIcon />
                        </motion.div>
                    )}
                </div>



                {/* FILTER BUTTONS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-3 mb-12 items-center justify-between"
                >
                    <div className="flex flex-wrap gap-3">
                        {(['top', 'new'] as const).map((mode) => (
                            <motion.button
                                key={mode}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSortChange(mode)}
                                className={`px-6 py-2 rounded-full font-display font-bold text-sm transition-all duration-300 border backdrop-blur-md ${
                                    sort === mode
                                        ? 'bg-primary text-black border-primary shadow-lg shadow-primary/30'
                                        : 'bg-surface/40 text-gray-300 border-white/10 hover:border-primary/40 hover:text-primary'
                                }`}
                            >
                                {getSortLabel(mode)}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* MAIN CONTENT AREA */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Main content area */}
                    <div className="flex-1 min-w-0 w-full max-w-4xl mx-auto">
                        {/* Section Title */}
                        <h2 className="text-2xl font-display font-bold text-white mb-8">Picks And Discussion</h2>

                        <NotificationBanner />

                        {/* Inline submit form */}
                        <AnimatePresence>
                            {showSubmit && !!user && (
                                <SubmitForm
                                    onClose={() => setShowSubmit(false)}
                                    onPostCreated={fetchFeed}
                                    onAuthRequired={handleAuthRequired}
                                />
                            )}
                        </AnimatePresence>

                        {/* Posts list or empty state */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 size={32} className="text-primary animate-spin" />
                                <p className="text-sm text-gray-400 font-mono">Loading picks...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-32 px-6 bg-surface/40 backdrop-blur-lg rounded-2xl border border-white/10"
                            >
                                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mb-6">
                                    <PenTool className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-display font-bold text-white mb-3">No Picks Yet</h3>
                                <p className="text-center text-gray-400 max-w-sm leading-relaxed">
                                    No picks have been published yet.
                                </p>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post, i) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                    >
                                        <PostCard
                                            post={post}
                                            onAuthRequired={handleAuthRequired}
                                            onPostUpdated={fetchFeed}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && posts.length > 0 && (
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        )}
                    </div>

                    {/* Sidebar — containing only Write a Pick button */}
                    <div className="w-full lg:w-72 flex-shrink-0 order-first lg:order-last">
                        <div className="lg:hidden mb-4">
                            <Sidebar onSubmitClick={handleSubmitClick} />
                        </div>
                        <div className="hidden lg:block sticky top-24">
                            <Sidebar onSubmitClick={handleSubmitClick} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </>
    );
}
