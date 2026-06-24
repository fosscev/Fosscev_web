"use client";

import { useEffect, useState, use } from 'react';
import { PostCard } from '@/components/picks/PostCard';
import { Sidebar } from '@/components/picks/Sidebar';
import { PicksPost } from '@/lib/picks-db';
import { usePicksAuth } from '@/components/picks/PicksAuthProvider';
import { AuthModal } from '@/components/picks/AuthModal';
import { ProfileIcon } from '@/components/picks/ProfileIcon';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PickDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const { user, authId } = usePicksAuth();
    const router = useRouter();
    
    const [post, setPost] = useState<PicksPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const url = new URL(`/api/picks/posts/${id}`, window.location.origin);
                if (authId) url.searchParams.set('auth_id', authId);

                const res = await fetch(url.toString());
                if (res.ok) {
                    const data = await res.json();
                    setPost(data);
                } else {
                    router.push('/picks');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id, authId, router]);

    const handleSubmitClick = () => {
        router.push('/picks?write=true');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 size={32} className="text-primary animate-spin" />
                <p className="text-sm text-gray-400 font-mono">Loading pick...</p>
            </div>
        );
    }

    if (!post) {
        return null; // Will redirect
    }

    return (
        <>
            <section className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto relative min-h-screen">
                {/* HEADER */}
                <div className="flex justify-between items-start gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1"
                    >
                        <button 
                            onClick={() => router.push('/picks')}
                            className="text-sm text-gray-400 hover:text-primary transition-colors flex items-center gap-2 mb-4"
                        >
                            ← Back to all picks
                        </button>
                        <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-2">
                            Pick Details
                        </h1>
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

                {/* MAIN CONTENT AREA */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Main content area */}
                    <div className="flex-1 min-w-0 w-full max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <PostCard
                                post={post}
                                onAuthRequired={() => setShowAuthModal(true)}
                                onPostUpdated={() => window.location.reload()}
                                isDetailedView={true}
                            />
                        </motion.div>
                    </div>

                    {/* Sidebar */}
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

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </>
    );
}
