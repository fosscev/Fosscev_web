"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Share2, Bookmark, Scale, X, ExternalLink, Trash2 } from 'lucide-react';
import { VoteButtons } from './VoteButtons';
import { CommentSection } from './CommentSection';
import { usePicksAuth } from './PicksAuthProvider';
import { FLAIR_COLORS, type PicksPost, type Flair } from '@/lib/picks-db';

interface PostCardProps {
    post: PicksPost;
    onAuthRequired: () => void;
}

function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export function PostCard({ post, onAuthRequired }: PostCardProps) {
    const [currentScore, setCurrentScore] = useState(post.score);
    const [currentVote, setCurrentVote] = useState<number | null>(post.user_vote || null);
    const [showComments, setShowComments] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [shareCopied, setShareCopied] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    const { user } = usePicksAuth();

    const flairColor = FLAIR_COLORS[post.flair as Flair] || '#6B7280';

    const handleVoteChange = (newScore: number, newVote: number | null) => {
        setCurrentScore(newScore);
        setCurrentVote(newVote);
    };

    const handleShare = async () => {
        try {
            const shareUrl = `${window.location.origin}/picks?post=${post.id}`;
            await navigator.clipboard.writeText(shareUrl);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 2000);
        } catch {
            // Fallback
        }
    };


    // Generate avatar color from username
    const username = post.author?.username || '?';
    const avatarHue = (username.charCodeAt(0) * 37) % 360;

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this pick?')) return;
        setIsDeleting(true);
        try {
            const { supabase } = await import('@/lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`/api/picks/posts/${post.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (res.ok) {
                setIsDeleted(true);
            }
        } catch (e) {
            console.error('Failed to delete', e);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isDeleted) return null;

    return (
        <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="group flex flex-col gap-3 rounded-2xl p-5 transition-all duration-200 bg-transparent border border-white/10 hover:border-white/30"
        >
            {/* Meta row: Avatar, Name, Timestamp */}
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{
                            background: `hsl(${avatarHue}, 40%, 20%)`,
                            color: `hsl(${avatarHue}, 60%, 70%)`,
                        }}
                    >
                        {username[0].toUpperCase()}
                    </div>
                    <div>
                        <span className="text-white font-semibold">{post.author?.username || 'anonymous'}</span>
                        <div className="text-xs text-gray-400 mt-0.5">{timeAgo(post.created_at)}</div>
                    </div>
                </div>
                {/* Flair */}
                <span
                    className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-white/20"
                    style={{
                        backgroundColor: `${flairColor}10`,
                        color: flairColor,
                        borderColor: `${flairColor}30`,
                    }}
                >
                    {post.flair}
                </span>
            </div>

            <div className="ml-13 mt-2 pl-13"> {/* Adjusting layout to have title below avatar slightly aligned or full width */}
                {/* Title */}
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-snug">
                    {post.title}
                </h3>

                {/* Description */}
                {post.description && (
                    <p className="text-sm text-gray-300 leading-relaxed mb-4 break-words line-clamp-3">
                        {post.description}
                    </p>
                )}

                {/* Post Image */}
                {post.image_url && (
                    <div
                        className="relative mt-2 mb-4 rounded-xl overflow-hidden max-h-80 flex items-center justify-center cursor-zoom-in bg-black/40 border border-white/10"
                    >
                        <img
                            src={post.image_url}
                            alt={post.title}
                            className="max-h-80 object-contain w-auto h-auto transition-transform duration-300 hover:scale-[1.02]"
                            loading="lazy"
                            onClick={() => setSelectedImage(post.image_url || null)}
                        />
                        <div
                            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center bg-black/30"
                        >
                            <ExternalLink size={20} className="text-white/70" />
                        </div>
                    </div>
                )}
            </div>

                {/* Actions row */}
                <div className="flex items-center gap-0.5 -ml-1.5">
                    <VoteButtons
                        postId={post.id}
                        score={currentScore}
                        userVote={currentVote}
                        onAuthRequired={onAuthRequired}
                        onVoteChange={handleVoteChange}
                    />

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-150"
                        style={{
                            color: showComments ? '#00e676' : '#525252',
                            background: showComments ? 'rgba(0,230,118,0.06)' : 'transparent',
                        }}
                        onMouseEnter={e => {
                            if (!showComments) (e.currentTarget as HTMLElement).style.color = '#a3a3a3';
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.color = showComments ? '#00e676' : '#525252';
                            (e.currentTarget as HTMLElement).style.background = showComments ? 'rgba(0,230,118,0.06)' : 'transparent';
                        }}
                    >
                        <MessageCircle size={13} />
                        <span>{post.comment_count ? `${post.comment_count}` : 'Comment'}</span>
                    </button>

                    <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-150"
                        style={{ color: shareCopied ? '#00e676' : '#525252' }}
                        onMouseEnter={e => {
                            if (!shareCopied) (e.currentTarget as HTMLElement).style.color = '#a3a3a3';
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.color = shareCopied ? '#00e676' : '#525252';
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }}
                    >
                        <Share2 size={13} />
                        <span>{shareCopied ? 'Copied!' : 'Share'}</span>
                    </button>


                    {user?.id === post.author_id && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-150 ml-auto disabled:opacity-40"
                            style={{ color: '#525252' }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.color = '#ef4444';
                                (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.color = '#525252';
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                            }}
                        >
                            <Trash2 size={13} />
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    )}
                </div>

                {/* Inline comments */}
                <AnimatePresence>
                    {showComments && (
                        <CommentSection
                            postId={post.id}
                            onAuthRequired={onAuthRequired}
                        />
                    )}
                </AnimatePresence>

            {/* Image Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 cursor-zoom-out"
                        style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(8px)' }}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-6 right-6 p-2 rounded-xl transition-colors"
                            style={{
                                background: 'rgba(0,230,118,0.1)',
                                border: '1px solid rgba(0,230,118,0.2)',
                                color: '#00e676',
                            }}
                        >
                            <X size={18} />
                        </button>
                        <motion.img
                            initial={{ scale: 0.94 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.94 }}
                            src={selectedImage}
                            alt="Zoomed pick image"
                            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                            style={{ boxShadow: '0 0 60px rgba(0,230,118,0.05)' }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
}
