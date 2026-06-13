"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Share2, Bookmark, Scale } from 'lucide-react';
import { VoteButtons } from './VoteButtons';
import { CommentSection } from './CommentSection';
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
    const [saved, setSaved] = useState(post.is_saved || false);
    const [isSaving, setIsSaving] = useState(false);

    const flairColor = FLAIR_COLORS[post.flair as Flair] || '#6B7280';

    const handleVoteChange = (newScore: number, newVote: number | null) => {
        setCurrentScore(newScore);
        setCurrentVote(newVote);
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch {
            // Fallback — do nothing
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { supabase } = await import('@/lib/supabase');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                onAuthRequired();
                setIsSaving(false);
                return;
            }

            const res = await fetch(`/api/picks/posts/${post.id}/save`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setSaved(data.isSaved);
            } else if (res.status === 401) {
                onAuthRequired();
            }
        } catch {
            // Silently fail
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="group flex gap-3 bg-[#0a0a0a]/80 border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.1] hover:bg-[#0e0e0e]/80 transition-all duration-200"
        >
            {/* Vote column */}
            <div className="flex-shrink-0 pt-1">
                <VoteButtons
                    postId={post.id}
                    score={currentScore}
                    userVote={currentVote}
                    onAuthRequired={onAuthRequired}
                    onVoteChange={handleVoteChange}
                />
            </div>

            {/* Content column */}
            <div className="flex-1 min-w-0">
                {/* Flair + Tool Name */}
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                        className="px-2 py-0.5 rounded text-xs font-mono font-semibold"
                        style={{
                            backgroundColor: `${flairColor}18`,
                            color: flairColor,
                            border: `1px solid ${flairColor}30`,
                        }}
                    >
                        {post.flair}
                    </span>
                    <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                        🛠 {post.tool_name}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-gray-100 mb-1 leading-snug">
                    {post.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 leading-relaxed mb-3 break-words">
                    {post.description}
                </p>

                {/* Meta row */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 flex-wrap">
                    <span className="flex items-center gap-1">
                        <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                            style={{
                                background: `hsl(${(post.author?.username || '').charCodeAt(0) * 37 % 360}, 50%, 25%)`,
                                color: `hsl(${(post.author?.username || '').charCodeAt(0) * 37 % 360}, 70%, 75%)`,
                            }}
                        >
                            {(post.author?.username || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-gray-400 font-medium">{post.author?.username || 'anonymous'}</span>
                    </span>
                    <span>·</span>
                    <span>{timeAgo(post.created_at)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                        <Scale size={11} />
                        {post.license}
                    </span>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-1 -ml-2">
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-colors"
                    >
                        <MessageCircle size={14} />
                        <span>Comments{post.comment_count ? ` (${post.comment_count})` : ''}</span>
                    </button>

                    <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-colors"
                    >
                        <Share2 size={14} />
                        <span>Share</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                        style={{ color: saved ? '#D85A30' : '#6b7280' }}
                    >
                        <Bookmark size={14} fill={saved ? '#D85A30' : 'none'} />
                        <span>{saved ? 'Saved' : 'Save'}</span>
                    </button>
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
            </div>
        </motion.article>
    );
}
