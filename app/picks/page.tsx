"use client";

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { usePicksAuth } from '@/components/picks/PicksAuthProvider';
import { PostCard } from '@/components/picks/PostCard';
import { SortTabs } from '@/components/picks/SortTabs';
import { Sidebar } from '@/components/picks/Sidebar';
import { SubmitForm } from '@/components/picks/SubmitForm';
import { Pagination } from '@/components/picks/Pagination';
import { AuthModal } from '@/components/picks/AuthModal';
import type { PicksPost, SortMode, Flair } from '@/lib/picks-db';

export default function PicksPage() {
    const { user, authId, loading: authLoading, signOut } = usePicksAuth();

    const [posts, setPosts] = useState<PicksPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState<SortMode>('hot');
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
        if (!user) {
            setShowAuthModal(true);
        } else {
            setShowSubmit(true);
        }
    };

    const handleAuthRequired = () => {
        setShowAuthModal(true);
    };

    return (
        <>
            <section className="pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-display font-black text-transparent bg-clip-text mb-2"
                                style={{ backgroundImage: 'linear-gradient(135deg, #fff 0%, #D85A30 50%, #fff 100%)' }}>
                                Open Source Picks
                            </h1>
                            <p className="text-sm text-gray-500 font-mono">
                                // Community-curated tools that actually help
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {user && (
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-400">
                                        <span className="text-[#D85A30] font-mono">{user.username}</span>
                                    </span>
                                    <button
                                        onClick={signOut}
                                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}

                            {/* Mobile submit button */}
                            <button
                                onClick={handleSubmitClick}
                                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
                                style={{
                                    background: 'rgba(216, 90, 48, 0.15)',
                                    color: '#D85A30',
                                    border: '1px solid rgba(216, 90, 48, 0.3)',
                                }}
                            >
                                <Plus size={14} strokeWidth={2.5} />
                                Submit
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main grid */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Feed column */}
                    <div className="flex-1 min-w-0">
                        {/* Sort tabs */}
                        <SortTabs
                            activeSort={sort}
                            onSortChange={handleSortChange}
                            isLoggedIn={!!user}
                        />

                        {/* Inline submit form */}
                        <AnimatePresence>
                            {showSubmit && (
                                <SubmitForm
                                    onClose={() => setShowSubmit(false)}
                                    onPostCreated={fetchFeed}
                                    onAuthRequired={handleAuthRequired}
                                />
                            )}
                        </AnimatePresence>

                        {/* Posts list */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Loader2 size={24} className="text-[#D85A30] animate-spin" />
                                <p className="text-sm text-gray-500 font-mono">Loading picks...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20"
                            >
                                <p className="text-lg text-gray-400 mb-2">No picks yet</p>
                                <p className="text-sm text-gray-600 mb-4">
                                    {flair
                                        ? `No posts with the "${flair}" flair yet.`
                                        : 'Be the first to share an open-source tool!'}
                                </p>
                                <button
                                    onClick={handleSubmitClick}
                                    className="px-4 py-2 rounded-lg text-sm font-semibold"
                                    style={{
                                        background: 'rgba(216, 90, 48, 0.15)',
                                        color: '#D85A30',
                                        border: '1px solid rgba(216, 90, 48, 0.3)',
                                    }}
                                >
                                    Submit the first pick →
                                </button>
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
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

                    {/* Sidebar — hidden on mobile, shown on desktop */}
                    <div className="w-full lg:w-72 flex-shrink-0 order-first lg:order-last">
                        {/* Mobile: horizontal flair filter */}
                        <div className="lg:hidden mb-4">
                            <Sidebar
                                activeFlair={flair}
                                onFlairChange={handleFlairChange}
                                onSubmitClick={handleSubmitClick}
                            />
                        </div>
                        {/* Desktop: full sidebar */}
                        <div className="hidden lg:block sticky top-24">
                            <Sidebar
                                activeFlair={flair}
                                onFlairChange={handleFlairChange}
                                onSubmitClick={handleSubmitClick}
                            />
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
