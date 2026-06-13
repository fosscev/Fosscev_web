"use client";

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Loader2, Terminal } from 'lucide-react';
import { usePicksAuth } from '@/components/picks/PicksAuthProvider';
import { PostCard } from '@/components/picks/PostCard';
import { SortTabs } from '@/components/picks/SortTabs';
import { Sidebar } from '@/components/picks/Sidebar';
import { SubmitForm } from '@/components/picks/SubmitForm';
import { Pagination } from '@/components/picks/Pagination';
import { AuthModal } from '@/components/picks/AuthModal';
import { ProfileIcon } from '@/components/picks/ProfileIcon';
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
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10"
                >
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            {/* Eyebrow tag */}
                            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-[#00e676]/20 bg-[#00e676]/5">
                                <Terminal size={12} className="text-[#00e676]" />
                                <span className="text-xs font-mono text-[#00e676]/80 tracking-wider uppercase">
                                    Community Feed
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-display font-black mb-2 leading-tight">
                                <span className="text-white">Open Source</span>{' '}
                                <span
                                    className="text-transparent bg-clip-text"
                                    style={{ backgroundImage: 'linear-gradient(135deg, #00e676 0%, #69f0ae 50%, #00e676 100%)' }}
                                >
                                    Picks
                                </span>
                            </h1>
                            <p className="text-sm text-gray-500 font-mono">
                                <span className="text-[#00e676]/60">//</span> Community-curated tools that actually help
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {user && <ProfileIcon />}

                            {/* Mobile submit button */}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSubmitClick}
                                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
                                style={{
                                    background: 'rgba(0, 230, 118, 0.12)',
                                    color: '#00e676',
                                    border: '1px solid rgba(0, 230, 118, 0.25)',
                                }}
                            >
                                <Plus size={14} strokeWidth={2.5} />
                                Submit
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Main grid */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Feed column */}
                    <div className="flex-1 min-w-0 xl:mr-8">
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
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <div className="relative">
                                    <div
                                        className="w-10 h-10 rounded-full"
                                        style={{
                                            border: '2px solid rgba(0,230,118,0.1)',
                                            borderTopColor: '#00e676',
                                            animation: 'spin 0.8s linear infinite',
                                        }}
                                    />
                                    <div
                                        className="absolute inset-0 rounded-full blur-md opacity-40"
                                        style={{ background: '#00e676' }}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 font-mono">
                                    <span className="text-[#00e676]/60">$</span> fetching picks...
                                </p>
                            </div>
                        ) : posts.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-24 border border-white/[0.05] rounded-2xl bg-[#0a0a0a]/50"
                            >
                                <div
                                    className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                                    style={{
                                        background: 'rgba(0,230,118,0.08)',
                                        border: '1px solid rgba(0,230,118,0.15)',
                                    }}
                                >
                                    <Terminal size={20} className="text-[#00e676]" />
                                </div>
                                <p className="text-base text-gray-300 font-semibold mb-1">No picks yet</p>
                                <p className="text-sm text-gray-500 mb-5">
                                    {flair
                                        ? `No posts with the "${flair}" flair yet.`
                                        : 'Be the first to share an open-source tool!'}
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleSubmitClick}
                                    className="px-5 py-2 rounded-xl text-sm font-semibold"
                                    style={{
                                        background: 'rgba(0, 230, 118, 0.12)',
                                        color: '#00e676',
                                        border: '1px solid rgba(0, 230, 118, 0.25)',
                                    }}
                                >
                                    Submit the first pick →
                                </motion.button>
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
                                {posts.map((post, i) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03, duration: 0.3 }}
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
