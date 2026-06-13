"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { usePicksAuth } from './PicksAuthProvider';
import type { PicksComment } from '@/lib/picks-db';

interface CommentSectionProps {
    postId: string;
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

export function CommentSection({ postId, onAuthRequired }: CommentSectionProps) {
    const { user, authId } = usePicksAuth();
    const [comments, setComments] = useState<PicksComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/picks/posts/${postId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data.comments);
            }
        } catch {
            // Silently fail
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authId) {
            onAuthRequired();
            return;
        }
        if (!body.trim() || submitting) return;

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`/api/picks/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auth_id: authId, body: body.trim() }),
            });

            if (res.ok) {
                const data = await res.json();
                setComments(prev => [...prev, data.comment]);
                setBody('');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to post comment');
            }
        } catch {
            setError('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
        >
            <div className="border-t border-white/6 mt-3 pt-3">
                {loading ? (
                    <div className="flex items-center gap-2 py-4 px-2">
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-[#D85A30] rounded-full animate-spin" />
                        <span className="text-sm text-gray-500">Loading comments...</span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {comments.length === 0 && (
                            <p className="text-sm text-gray-500 py-2 px-2">No comments yet. Be the first to share your thoughts!</p>
                        )}

                        <AnimatePresence mode="popLayout">
                            {comments.map((comment) => (
                                <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                                >
                                    {/* Avatar */}
                                    <div
                                        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                                        style={{
                                            background: `hsl(${(comment.author?.username || '').charCodeAt(0) * 37 % 360}, 50%, 25%)`,
                                            color: `hsl(${(comment.author?.username || '').charCodeAt(0) * 37 % 360}, 70%, 75%)`,
                                        }}
                                    >
                                        {(comment.author?.username || '?')[0].toUpperCase()}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-semibold text-gray-300">
                                                {comment.author?.username || 'anon'}
                                            </span>
                                            <span className="text-xs text-gray-600">·</span>
                                            <span className="text-xs text-gray-500">
                                                {timeAgo(comment.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed break-words">
                                            {comment.body}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Comment input */}
                        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-2 pt-2">
                            <input
                                type="text"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder={user ? "Add a comment..." : "Sign in to comment"}
                                maxLength={1000}
                                disabled={!user || submitting}
                                className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/8 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D85A30]/40 focus:ring-1 focus:ring-[#D85A30]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                onClick={() => !user && onAuthRequired()}
                            />
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                type="submit"
                                disabled={!body.trim() || submitting || !user}
                                className="p-2 rounded-lg transition-all duration-150 disabled:opacity-30"
                                style={{
                                    background: body.trim() ? 'rgba(216, 90, 48, 0.15)' : 'transparent',
                                    color: body.trim() ? '#D85A30' : '#525252',
                                }}
                            >
                                <Send size={16} />
                            </motion.button>
                        </form>

                        {error && (
                            <p className="text-xs text-red-400 px-2">{error}</p>
                        )}

                        {body.length > 0 && (
                            <div className="px-2">
                                <span className="text-xs text-gray-600">{body.length}/1000</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
